import { SpeechParseObject } from "../../types/vendors/elevenlabs";
import { callbackMDParagraphs } from "../../utils/md";
import { ScriptParseItem } from "../../types";

/**
 * @todo `voice_id` and `model_id` cmd opt-ins are not yet implemented.
 */
export const parse = (items: { type: string, content: string }[], voice_id?: string, model_id?: string): SpeechParseObject[] => {
	const response: SpeechParseObject[] = [];

	callbackMDParagraphs(items, async (value: ScriptParseItem, index) => {
		const { content: text, params } = value;
		const { anim_type } = params || {};

		response.push({
			custom: {
				voice_id,
				model_id
			},
			body: {
				text
			}
		});
	}, false);

	return response;
};
