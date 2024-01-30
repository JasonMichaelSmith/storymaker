import { PromptParseObject } from "../../types/vendors/midjourney";

/**
 * @param items Basic parsed object with a type + content to map to a speech input object.
 */
export const parse = (items: { type: string, content: string }[]): PromptParseObject[] => {
	return items
		.map((x) => {
			// markdown paragraph
			if (x.type === "inline") {
				return {
					imagine: x.content,
				};
			}
		})
		.filter(Boolean) as PromptParseObject[];
};