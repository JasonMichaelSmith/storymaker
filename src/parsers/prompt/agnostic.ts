import { PromptParseObject } from "../../types/prompt";

/**
 * @param items Basic parsed object with a type + content to map to a speech input object.
 */
export const parse = async (items: { type: string, content: string }[]): Promise<PromptParseObject[]> => {
	return (await Promise.all(items
		.map(async (x) => {

			// TODO: generate visualise prompt with openai (see constants/prompts)
			// TODO: generate aniamte prompt with openai (see constants/prompts)

			// markdown paragraph
			if (x.type === "inline") {
				return {
					speech: x.content,
					visualise: "TODO",
					animate: "TODO",
				};
			}
		})
	)).filter(Boolean) as PromptParseObject[];
};