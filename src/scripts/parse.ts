import { Vendor, Media } from "../types";
import { getMDMeta } from "../utils/md";

import * as parsers from "../parsers";
import * as speech from "../speech";

export const parse = async (filename: string, voice: string, type = Media.Speech, vendor = Vendor.OpenAI): Promise<void> => {
	const script = getMDMeta(`./scripts/${filename}`);

	switch (type) {
		default:
		case Media.Speech: {
			switch (vendor) {
				default:
				case Vendor.OpenAI:
					const input = parsers.speech.openai.parse(script, voice);
					await speech.openai.parse(filename, input);
					break;
			}
		}
	}
}

const [, , filename = "sample1.md", voice = "onyx", type, vendor] = process.argv;

/**
 * @example `yarn scripts/parse sample2.md shimmer`.
 */
parse(filename, voice, type as Media, vendor as Vendor);