import { getFilename, getJSON } from "../utils/file";
import { Vendor, Media, Paradigm } from "../types";
import { JSONPromptData } from "../types/json";
import { getMDMeta } from "../utils/md";

import * as parsers from "../parsers";
import * as speech from "../speech";
import * as prompt from "../prompt";
import * as bridge from "../bridge";

export const parse = async (
	filename: string,
	type: Media | Paradigm = Media.Speech,
	vendor = Vendor.OpenAI,
	...args: string[]
): Promise<void> => {
	const script = getMDMeta(`./inputs/scripts/${filename}`);

	switch (type) {
		default:
		case Media.Speech: {
			switch (vendor) {
				default:
				case Vendor.OpenAI:
					const voice = args[0];
					const input = parsers.speech.openai.parse(script, voice);
					await speech.openai.generate(filename, input);
					return;
			}
		}
		case Media.Image: {
			switch (vendor) {
				// You'll need to run the prompt paradigm first so this JSON actually exists (see "Prompt Examples")
				default:
				case Vendor.Midjourney:
					const prompts = getJSON(`./bin/prompt/${getFilename(filename)}/prompts.json`);
					await bridge.goapi.generate(getFilename(filename), prompts as JSONPromptData);
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
				case Vendor.OpenAI:
					const input = await parsers.prompt.agnostic.parse(filename, script);
					await prompt.agnostic.generate(getFilename(filename), input);
					return;
			}
		}
	}
}

const [, , filename = "sample1.md", type, vendor, ...rest] = process.argv;

/**
 * Speech Examples
 * 
 * @example `yarn scripts/parse`.
 * @example `yarn scripts/parse sample2.md`.
 * @example `yarn scripts/parse sample3.md speech openai shimmer`.
 * 
 * Prompt Examples
 * 
 * @example `yarn scripts/parse sample1.md prompt`.
 * 
 * Image Examples
 * 
 * @example `yarn scripts/parse sample1.md image`.
 */
parse(filename, type as any, vendor as Vendor, ...rest);