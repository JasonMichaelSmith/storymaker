import { getMDMeta } from "../utils/md";
import { Vendor } from "../types";

import * as elevenlabs from "./elevenlabs";
import * as parsers from "../parsers";
import * as openai from "./openai";

export const parse = async (name: string, index: number = 0, voice?: string, model?: string, vendor = Vendor.ElevenLabs): Promise<void> => {
	const script = getMDMeta(`./inputs/scripts/${name}.md`);

	switch (vendor) {
		default:
		case Vendor.ElevenLabs: {
			const input = parsers.speech.elevenlabs.parse(script, voice, model);
			await elevenlabs.gen(name, input[index], index);
			break;
		}

		case Vendor.OpenAI: {
			const input = parsers.speech.openai.parse(script, voice, model);
			await openai.gen(name, input[index].body, index);
			break;
		}
	}
}

const [, , name = "sample1", index, voice, model] = process.argv;

/**
 * @example `yarn speech/parse sample1 0`
 * @example `yarn speech/parse sample1 0 A8kdTy0R3V3IV8hT8Q4v` (custom voice id with elevenlabs)
 */
parse(name, Number(index), voice, model);