import { Vendor, Media, Paradigm } from "../types";
import { JSONPromptData } from "../types/json";
import { getMDMeta } from "../utils/md";
import { getJSON } from "../utils/file";
import { listify } from "../utils/misc";

import * as parsers from "../parsers";
import * as speech from "../speech";
import * as prompt from "../prompt";
import * as bridge from "../bridge";

export const parse = async (
	name: string,
	type: Media | Paradigm = Media.Speech,
	vendor = Vendor.ElevenLabs,
	...args: string[]
): Promise<void> => {
	const script = getMDMeta(`./inputs/scripts/${name}.md`);

	switch (type) {
		default:
		case Media.Speech: {
			switch (vendor) {
				default:
				case Vendor.ElevenLabs: {
					const voice_id = args[0];
					const model_id = args[1];
					const input = parsers.speech.elevenlabs.parse(script, voice_id, model_id);
					await speech.elevenlabs.generate(name, input);
					return;
				}

				case Vendor.OpenAI: {
					const voice = args[0];
					const input = parsers.speech.openai.parse(script, voice);
					await speech.openai.generate(name, input);
					return;
				}
			}
		}
		case Media.Image: {
			switch (vendor) {
				// You'll need to run the prompt paradigm first so this JSON actually exists (see "Prompt Examples")
				default:
				case Vendor.Midjourney:
					const startIndex = Number(args[0]) || 0;
					const prompts = getJSON(`./bin/prompt/${name}/prompts.json`);
					await bridge.goapi.generate(name, prompts as JSONPromptData, startIndex);
					return;
			}
		}
		case Media.Video: {
			// TBD: this would pass the script into video scenes
		}
		case Paradigm.Prompt: {
			switch (vendor) {
				default:
				case Vendor.Midjourney:
				case Vendor.ElevenLabs:
				case Vendor.OpenAI:
					const indices = listify(args[0]);
					const input = await parsers.prompt.agnostic.parse(name, script, indices);
					await prompt.agnostic.generate(name, input);
					return;
			}
		}
	}
}

const [, , name = "sample1", type, vendor, ...rest] = process.argv;

/**
 * Speech Examples
 * 
 * @example `yarn scripts/parse`
 * @example `yarn scripts/parse sample2`
 * @example `yarn scripts/parse sample3 speech elevenlabs Hv8mUtlN9ShzbFo2k5ki dfnBSF4DafO3rta8aSbF`
 * @example `yarn scripts/parse sample3 speech openai shimmer`
 * 
 * Prompt Examples
 * 
 * @example `yarn scripts/parse sample1 prompt`
 * @example `yarn scripts/parse sample1 prompt openai 5` (start from prompt 5 from 0)
 * 
 * Image Examples
 * 
 * @example `yarn scripts/parse sample1 image`
 * @example `yarn scripts/parse sample1 image midjourney 1` (start at 1 because 0 was already generated)
 * 
 * Spelling Examples
 * 
 * @example `yarn scripts/spelling sample1`
 */
parse(name, type as any, vendor as Vendor, ...rest);