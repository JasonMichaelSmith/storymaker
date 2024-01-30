/**
 * @param items Basic parsed object with a type + content to map to a speech input object.
 * @param voice SpeechCreateParams.voice: "onyx" | "alloy" | "echo" | "fable" | "nova" | "shimmer".
 * @param model SpeechCreateParams.model: "tts-1" | (string & {}) | "tts-1-hd".
 */
export const parse = (items: { type: string, content: string }[], voice = "onyx", model = "tts-1"): any[] => {
	return items
		.map((x) => {
			// markdown paragraph
			if (x.type === "inline") {
				return {
					body: {
						model,
						voice,
						input: x.content,
					},
				};
			}
		})
		.filter(Boolean);
};