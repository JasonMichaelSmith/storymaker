import { Upscale, type TaskStatus } from "../types/midjourney";
import type { JSONPromptData } from "../types/json";

import { genDefaultImagineArgs, getTaskResult } from "../utils/midjourney";
import { openInBrowser, promptForInput } from "../utils/terminal";
import { argsToString, mstosec, truncate } from "../utils/misc";
import { getJSON, mkdirSync } from "../utils/file";
import { downloadImage } from "../utils/image";
import { Media, Vendor } from "../types";

import { log } from "console";

import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import fs from "fs";

dotenv.config();

const domain = "https://api.midjourneyapi.xyz/mj/v2";

type MidjourneyGeneralResponse = {
	task_id: string;
	status: TaskStatus;
	message: string;
}

enum GenerationType {
	Imagine = "imagine",
	Upscale = "upscale",
}

/**
 * @see https://doc.goapi.ai/midjourney-api/midjourney-api-v2#imagine
 * @see https://doc.goapi.ai/midjourney-api/midjourney-api-v2#fetch
 * @see https://doc.goapi.ai/midjourney-api/midjourney-api-v2#upscale
 * @see https://doc.goapi.ai/midjourney-api/midjourney-task-result
 * @see https://builtopia.feishu.cn/wiki/IRZUwdEsfiNNfak6sSKcgGTPnFY (for `image_urls`)
 * @see https://docs.midjourney.com/docs/image-prompts
 * 
 * @note You can use `startIndex` to pick up where a full all-scene generation left off if
 * 		 a random error stopped the complete list of images from being generated.
 */
export const generate = async (
	name: string,
	imagines: JSONPromptData,
	startIndex = 0,
	type = Media.Image,
	vendor = Vendor.Midjourney
): Promise<void> => {
	switch (type) {
		default:
		case Media.Image: {
			switch (vendor) {
				default:
				case Vendor.Midjourney: {
					const { visualise } = imagines;

					const folder = mkdirSync(`./bin/image/${name}`);
					const results: string[] = startIndex > 0 ? getJSON<string[]>(`./bin/image/${name}/results.json`) : [];

					for (let i = startIndex; i < visualise.length; i++) {
						// Note: not using previous by default as it can create undesirable results; however, you
						// can still use it via opt-in with the `image/parse` command (see docs for details)
						const { previous, args } = genDefaultImagineArgs(i, results);

						log(`imagining ${i}: ${argsToString([truncate(visualise[i]), args])}`);

						const image = await gen(
							i,
							folder,
							argsToString([visualise[i], args])
						);

						// Override existing result for a former index, or push for the latest
						results[i] = image;

						await downloadImage(image, `${folder}/image-${i}.png`);

						log(`downloaded image ${i}: ${image}`);

						// Write the resulting image url to a JSON file for reference, or for re-creating specific images (via `image/parse`)
						// The reason we write per visual is to have this file present in the event of a failure halfway through, so we can pick up where we left off
						await fs.promises.writeFile(path.resolve(`./bin/image/${name}/results.json`), JSON.stringify(results));
					}
				}
			}
		}
	}
}

export const gen = async (
	index: number,
	folder: string,
	prompt: string,
	review_wait_time: number = 20000
): Promise<string> => {

	// Imagine
	const options_imagine = options({
		aspect_ratio: "16:9",
		process_mode: "fast",
	});
	options_imagine.data.prompt = prompt;

	const imagine = await axios<MidjourneyGeneralResponse>(options_imagine);
	const fetch_imagine = await getTaskResult(
		index,
		GenerationType.Imagine,
		imagine.data.task_id,
		domain
	);

	log(`fetched imagine ${index}: ${fetch_imagine.task_id}`);

	// Give us time to review the image before the upscale commences (handy for spot creations and cancels for undesired results)
	log(`review the image in ${mstosec(review_wait_time)}s before upscale: ${fetch_imagine.task_result.image_url}`);
	openInBrowser(fetch_imagine.task_result.image_url);

	// Prompt index to select 1/4 images from Midjourney after a review (1 is the default; top-left)
	const imagine_index = (await promptForInput("Enter an index if required (1 is the default)")) || "1";

	// Upscale to isolate one image from index 1 of 4 (default for 16:9 last seen was "1456×816")
	let options_upscale = options({
		origin_task_id: fetch_imagine.task_id,
		index: imagine_index,
	}, GenerationType.Upscale);

	log(`proceeding to upscale image index: ${imagine_index}`);

	let upscale = await axios<MidjourneyGeneralResponse>(options_upscale);
	let fetch_upscale = await getTaskResult(
		index,
		GenerationType.Upscale,
		upscale.data.task_id,
		domain
	);

	log(`fetched upscale #1 ${index}: ${fetch_upscale.task_id}`);

	// Upscale again to get the resolution we want (per the default 16:9 above, it'll double to: "2912×1632")
	options_upscale = options({
		origin_task_id: fetch_upscale.task_id,
		index: Upscale.Subtle,
	}, GenerationType.Upscale);

	upscale = await axios<MidjourneyGeneralResponse>(options_upscale);
	fetch_upscale = await getTaskResult(
		index,
		GenerationType.Upscale,
		upscale.data.task_id,
		domain
	);

	log(`fetched upscale #2 ${index}: ${fetch_upscale.task_id}`);

	// Add single upscaled image to result for this scene
	const image = fetch_upscale.task_result.image_url;

	log(`downloading image ${index}: ${image}`);

	await downloadImage(image, `${folder}/image-${index}.png`);

	return image;
}

const options = (data: Record<string, any>, service = GenerationType.Imagine): Record<string, any> => ({
	headers: {
		"X-API-KEY": process.env.GOAPI_API_KEY
	},
	data,
	url: `${domain}/${service}`,
	method: 'post'
});