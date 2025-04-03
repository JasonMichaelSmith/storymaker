import { TaskStatus } from "../types/midjourney";
import { argsToString, sleep } from "./misc";
import { prompts } from "../constants";

import { log, error } from "console";

import axios from "axios";

type TaskResponse = {
	task_id: string;
	status: TaskStatus;
	task_result: {
		discord_image_url: string;
		image_url: string;
		image_urls: string[];
		[name: string]: any;
	}
	meta: Record<string, any>;
	[name: string]: any;
}

/**
 * @example `--sref urlA urlB urlC`
 * @example You can also set weights of styles like this `--sref urlA::2 urlB::3 urlC::5`
 * @example You can also set the total strength of the stylization via `--sw 100` (100 is default, 0 is off, 1000 is maximum)
 */
export const getStyleRefArg = (urls: string[]): string => {
	return `--sref ${urls.join(" ")}`;
}

/**
 * @example `{ previous: "cdn.midjourney/imagine/123.png", args: "unreal engine 5 --sref cdn.midjourney/imagine/123.png --sw 30" }`
 * 
 * @param results URLs of previously generated images, or an array of generated image URLs to reference per the index.
 * 
 * @important The `--sref` is crucial for Narrated Stills storytelling. It ensures each scene image is in the same
 * 			  style + colour palette, creating an important sense of consistency throughout the story. Though the 100
 * 			  default is often too much on average, so we hard-code a `30` weight for best results.
 */
export const genDefaultImagineArgs = (index: number, results: string[], extra_args?: string): { previous?: string, args?: string } => {
	// The previous image generated can feed into the next one for more consistent objective continuity per image
	// This is returned separately as it's opt-in per scene context (generally not desirable as a default)
	const previous = index > 0 ? results[index - 1] : undefined;

	// The style reference image is either the previous scene if applicable, or the first scene
	const style_ref = index > 0 ? results[index - 1] || results[0] : results[0];

	// Don't append the default style reference/s if we included our own custom weight
	const extra_args_sref = extra_args?.includes("--sref");

	// Don't append the default style weight if we included our own custom weight
	const extra_args_sw = extra_args?.includes("--sw");

	// Append some default optimised args for general-purpose high-fidelity rendering across each scene
	// Also append a style reference per scene visual to match the first one for consistent styling/colour throughout
	const args = argsToString([
		prompts.visual.ending.ultrarealistic,
		index > 0 && !extra_args_sref ? getStyleRefArg([style_ref]) : undefined,
		style_ref && !extra_args_sw && "--sw 30"
	]);

	return { previous, args };
}

export async function getTaskResult<T extends TaskResponse>(
	index: number,
	name: string,
	task_id: string,
	domain: string,
	interval = 5000
): Promise<T> {
	let data: T | undefined = undefined;
	let status = TaskStatus.Pending;

	// Loop until status is no longer in an idle state
	while (
		status === TaskStatus.Staged ||
		status === TaskStatus.Pending ||
		status === TaskStatus.Processing ||
		status === TaskStatus.Retry
	) {
		try {
			const task = await axios.post(`${domain}/fetch`, { task_id });

			data = task.data as T;
			status = data.status;

			if (status === TaskStatus.Finished) {
				// Task finished, break out of the loop
				break;
			} else if (status === TaskStatus.Failed) {
				// Terminal error
				throw new Error(`failed status: ${data}`);
			}

			// See status intervals for current task
			// TODO: only re-log if the status changes from the last
			log(`${name} task ${index}: ${status}`);

			// Wait for a while before making the next request (1 second default)
			await sleep(interval);

		} catch (err: any) {
			// Note: errors caught with no message can mean your prompt contains banned words or phrases
			error('internal catch error:', JSON.stringify(err));
		}
	}

	if (!data) {
		throw new Error(`task data was never defined`);
	}

	return data;
}