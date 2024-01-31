import { Vendor, Media, Paradigm } from "../types";
import { getMDMeta } from "../utils/md";

import * as parsers from "../parsers";
import * as speech from "../speech";
import * as prompt from "../prompt";

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
					break;
			}
		}
		case Media.Image: {
			// TBD: this would pass the script into images
		}
		case Media.Video: {
			// TBD: this would pass the script into video scenes
		}
		case Paradigm.Prompt: {
			switch (vendor) {
				default:
				case Vendor.Midjourney:
				case Vendor.OpenAI:
					const input = parsers.prompt.agnostic.parse(script);
					await prompt.agnostic.generate(filename, input);
					break;
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
 * @example `yarn scripts/parse sample1.md prompt midjourney`.
 */
parse(filename, type as any, vendor as Vendor, ...rest);