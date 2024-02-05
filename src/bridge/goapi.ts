import type { JSONPromptData } from "../types/json";
import { Media, Vendor } from "../types";

import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

/**
 * @see https://doc.goapi.ai/midjourney-api/midjourney-api-v2#imagine
 */
export const generate = async (name: string, prompts: JSONPromptData, type = Media.Image, vendor = Vendor.Midjourney): Promise<void> => {
	switch (type) {
		default:
		case Media.Image: {
			switch (vendor) {
				default:
				case Vendor.Midjourney: {
					const { visualise } = prompts;

					// TODO: type
					const results: any = [];

					async function imagine(visualise: string[]) {
						for (let i = 0; i < visualise.length; i++) {
							// The previous image generated will feed into the next one for more consistent styling per image
							const previous: string = i > 0 ? results[i - 1].url : "";

							const options = {
								headers: {
									"X-API-KEY": process.env.GOAPI_API_KEY
								},
								data: {
									"prompt": `${previous} ${visualise[i]}`,
									"aspect_ratio": "4:3",
									"process_mode": "fast",
									"webhook_endpoint": "",
									"webhook_secret": ""
								},
								url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
								method: 'post'
							};

							const response = await axios(options);
							results.push(response.data);
						}

						await imagine(visualise);
					}
				}
			}
		}
	}
}