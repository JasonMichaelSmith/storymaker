import { getMDMeta } from "../utils/md";
import * as parsers from "../parsers";

// TODO: parameterise openai as an option + default
export const parse = (filename: string, type = "speech", vendor = "openai") => {
	const input = getMDMeta(`./scripts/${filename}`);
	return parsers.speech.openai.parse(input);
}

console.log(parse("cabin-in-the-woods.md"));