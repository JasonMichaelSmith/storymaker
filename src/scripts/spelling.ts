import { genericSinglePromptChat } from "../utils/openai";
import { getMDPlainText } from "../utils/md";
import { transform } from "../utils/prompt";
import { prompts } from "../constants";
import { Vendor } from "../types";

export const spelling = async (
	name: string,
	...args: string[]
): Promise<void> => {
	const script = getMDPlainText(`./inputs/scripts/${name}.md`);

	const response = await genericSinglePromptChat([{
		"role": "user",
		"content": transform(prompts.story.edit.evaluate.spelling(), script)
	}]);

	console.log(response);
}

const [, , name = "sample1", type, vendor, ...rest] = process.argv;

/**
 * @example `yarn scripts/spelling sample1`.
 */
spelling(name, type as any, vendor as Vendor, ...rest);