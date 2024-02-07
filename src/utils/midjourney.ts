import { TaskStatus } from "../types/midjourney";
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

export async function getTaskResult<T extends TaskResponse>(
	index: number,
	name: string,
	task_id: string,
	domain: string,
	interval = 1000
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

			// Wait for a while before making the next request
			await new Promise(resolve => setTimeout(resolve, interval)); // Wait for 1 second (default)
		} catch (err: any) {
			error(err);
			throw new Error(`internal error checking task status: ${JSON.stringify(err)}`);
		}
	}

	if (!data) {
		throw new Error(`task data was never defined`);
	}

	return data;
}