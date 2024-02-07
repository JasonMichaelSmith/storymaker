import type { TaskStatus } from "../types/midjourney";
import type { JSONPromptData } from "../types/json";

import { getTaskResult } from "../utils/midjourney";
import { downloadImage } from "../utils/image";
import { mkdirSync } from "../utils/file";
import { Media, Vendor } from "../types";
import { truncate } from "../utils/misc";
import { log } from "console";

import dotenv from "dotenv";
import axios from "axios";

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
 */
export const generate = async (
	name: string,
	prompts: JSONPromptData,
	type = Media.Image,
	vendor = Vendor.Midjourney
): Promise<void> => {
	switch (type) {
		default:
		case Media.Image: {
			switch (vendor) {
				default:
				case Vendor.Midjourney: {
					const { visualise } = prompts;

					const folder = mkdirSync(`./bin/image/${name}`);
					const results: string[] = [];

					async function imagine(visualise: string[]) {
						for (let i = 0; i < visualise.length; i++) {
							// The previous image generated will feed into the next one for more consistent styling per image
							const previous: string = i > 0 ? `${results[i - 1]} ` : "";

							log(`imagining ${i}: ${previous + truncate(visualise[i])}`);

							// Imagine
							const options_imagine = { ...options };
							options_imagine.data.prompt = `${previous} ${visualise[i]}`;

							const imagine = await axios<MidjourneyGeneralResponse>(options_imagine);
							const fetch_imagine = await getTaskResult(i, GenerationType.Imagine, imagine.data.task_id, domain);

							log(`fetched imagine ${i}: ${fetch_imagine.task_id}`);

							// Upscale
							const options_upscale = { ...options };
							options_upscale.data.origin_task_id = fetch_imagine.task_id;
							options_upscale.data.index = 1; // First image in x4 grid

							const upscale = await axios<MidjourneyGeneralResponse>(options_upscale);
							const fetch_upscale = await getTaskResult(i, GenerationType.Upscale, upscale.data.task_id, domain);

							log(`fetched upscale ${i}: ${fetch_upscale.task_id}`);

							// Add single upscaled image to result for this scene
							const image = fetch_upscale.task_result.image_url;
							results.push(image);

							log(`downloading image ${i}: ${image}`);

							await downloadImage(image, `${folder}/image-${i}.png`);
						}
					}

					await imagine(visualise);
				}
			}
		}
	}
}

const options: Record<string, any> = {
	headers: {
		"X-API-KEY": process.env.GOAPI_API_KEY
	},
	data: {
		"aspect_ratio": "16:9",
		"process_mode": "fast",
		"webhook_endpoint": "",
		"webhook_secret": ""
	},
	url: `${domain}/imagine`,
	method: 'post'
};