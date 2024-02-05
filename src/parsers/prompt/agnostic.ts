import { AnimationPromptType, Direction, PromptParseObject } from "../../types/prompt";
import { prompts, chat } from "../../constants";
import { transform } from "../../utils/prompt";

import openai from "../../vendors/openai";

import { log } from "console";

import type { ChatCompletionMessageParam } from "openai/resources";

type ParseItem = {
	type: string,
	content: string,
	params?: { anim_type: AnimationPromptType }
}

const defaults = {
	openai: {
		model: "gpt-4"
	}
};

/**
 * The purpose of parse is to transform basic script paragraphs into a 'visualise' prompt and an 'animate' prompt. These
 * prompts are then used with their equivalent AI to generate media for the script, per paragraph/scene. This media is
 * ultimately a motion video/animation that aligns with the scene/paragraph.
 * 
 * @param items Basic parsed object with a type + content to map to a speech input object, or AI media-generation prompt.
 */
export const parse = async (name: string, items: ParseItem[]): Promise<PromptParseObject[]> => {
	let i = 0;
	return (await Promise.all(items
		.map(async x => {
			const { type, content: speech, params } = x;
			const { anim_type } = params || {};

			// Markdown paragraph
			if (type === "inline") {
				// Generate visualise prompt with openai
				const visualise = await getVisualPrompt(speech);

				// Generate animate prompt with openai
				const animate = await getAnimPrompt(speech, anim_type);

				// Log completion per scene
				log(`${name} scene ${i} prompt agnostic done`);

				i++;

				return {
					speech,
					visualise,
					animate,
				};
			}
		})
	)).filter(Boolean) as PromptParseObject[];
};

/**
 * @param content The original speech or written scene/segment.
 * @example "You are in a cold, dark room" transforms to visual prompt: "A cold dark room".
 */
const getVisualPrompt = async (content: string) => {
	return await genericSinglePromptChat([{
		"role": "user",
		"content": transform(prompts.scene.make.abiotic.from.secondperson, content)
	}]);
}

/**
 * @param content The original speech or written scene/segment.
 * @example "You are in a cold, dark room, with bad lighting" transforms to animate prompt: "dark, subtle light, light flickering, -camera pans horizontally slowly".
 */
const getAnimPrompt = async (content: string, type?: AnimationPromptType, direction?: Direction) => {
	direction ||= Direction.Forward;

	switch (type) {
		default:
		case AnimationPromptType.WithImage:
			const movement = await genericSinglePromptChat([{
				"role": "user",
				"content": transform(prompts.scene.make.animated.from.abiotic.move.generic, content)
			}]);

			const camera = await genericSinglePromptChat([{
				"role": "user",
				"content": transform(prompts.camera.decide.direction, content)
			}]);

			return `${movement} -camera ${camera}`;

		case AnimationPromptType.FromScratch:
			// TBD
			break;
	}
}

const genericSinglePromptChat = async (messages: ChatCompletionMessageParam[]): Promise<string | null> => {
	return (await openai.chat.completions.create({
		messages: [
			chat.completions.messages.system.generic,
			...messages
		],
		model: defaults.openai.model,
	})).choices[0].message.content;
}