import { SpeechParseObject } from "../../types/vendors/openai";
import { callbackMDParagraphs } from "../../utils/md";
import { ScriptParseItem } from "../../types";

/**
 * @param items Basic parsed object with a type + content to map to a speech input object.
 * @param voice SpeechCreateParams.voice: "onyx" | "alloy" | "echo" | "fable" | "nova" | "shimmer".
 * @param model SpeechCreateParams.model: "tts-1" | (string & {}) | "tts-1-hd".
 */
export const parse = (items: { type: string, content: string }[], voice = "onyx", model = "tts-1"): SpeechParseObject[] => {
	const response: SpeechParseObject[] = [];

	callbackMDParagraphs(items, async (value: ScriptParseItem, index) => {
		const { content: input, params } = value;
		const { anim_type } = params || {};

		response.push({
			body: {
				model,
				voice,
				input,
			},
		} as SpeechParseObject);
	}, false);

	return response;
};