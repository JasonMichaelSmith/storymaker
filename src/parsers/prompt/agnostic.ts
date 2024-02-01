import { AnimationPromptType, Direction, PromptParseObject } from "../../types/prompt";
import { prompts } from "../../constants/prompts";
import { transform } from "../../utils/prompt";

import openai from "../../vendors/openai";

type ParseItem = {
	type: string,
	content: string,
	params?: { animtype: AnimationPromptType }
};

/**
 * @param items Basic parsed object with a type + content to map to a speech input object.
 */
export const parse = async (items: ParseItem[]): Promise<PromptParseObject[]> => {
	return (await Promise.all(items
		.map(async (x) => {
			const { type, content, params } = x;
			const { animtype } = params || {};

			// markdown paragraph
			if (type === "inline") {
				// Generate visualise prompt with openai
				const visualise = await getVisualPrompt(content);

				// Generate animate prompt with openai
				const animate = await getAnimPrompt(content, animtype);

				return {
					speech: `Speech: ${content}`,
					visualise: `Visualise: ${visualise}`,
					animate: `Animate: ${animate}`,
				};
			}
		})
	)).filter(Boolean) as PromptParseObject[];
};

const getVisualPrompt = async (content: string) => {
	console.log(transform(prompts.scene.make.abiotic.from.secondperson, content));

	return (await openai.chat.completions.create({
		messages: [
			{ "role": "user", "content": transform(prompts.scene.make.abiotic.from.secondperson, content) }
		],
		model: "gpt-3.5-turbo",
	})).choices[0].message.content;
}

const getAnimPrompt = async (content: string, type?: AnimationPromptType, direction?: Direction) => {
	direction ||= Direction.Forward;

	switch (type) {
		default:
		case AnimationPromptType.WithImage:
			return prompts.scene.make.animated.from.abiotic.move[direction];

		case AnimationPromptType.FromScratch:
			// TODO: this doesn't assemble properly
			const completions = await openai.chat.completions.create({
				messages: [
					{ "role": "system", "content": "You are a helpful assistant." },
					{ "role": "user", "content": transform(prompts.scene.make.animated.from.abiotic.move[direction], content) }
				],
				model: "gpt-3.5-turbo",
			});
			return completions.choices[0].message.content;
	}
}