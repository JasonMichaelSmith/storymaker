import type { ChatCompletionMessageParam } from "openai/resources";

import openai from "../vendors/openai";
import { chat } from "../constants";

const defaults = {
	openai: {
		model: "gpt-4"
	}
};

export const genericSinglePromptChat = async (messages: ChatCompletionMessageParam[]): Promise<string | null> => {
	return (await openai.chat.completions.create({
		messages: [
			chat.completions.messages.system.generic,
			...messages
		],
		model: defaults.openai.model,
	})).choices[0].message.content;
}