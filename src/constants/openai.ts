import { ChatCompletionMessageParam } from "openai/resources";

type Chat = {
	completions: {
		messages: {
			system: {
				generic: ChatCompletionMessageParam
			}
		}
	}
}

export const chat: Chat = {
	completions: {
		messages: {
			system: {
				generic: { "role": "system", "content": "You are a helpful assistant." }
			}
		}
	}
}