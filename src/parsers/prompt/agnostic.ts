import { AnimationPromptType, Direction, PromptParseObject } from "../../types/prompt";
import { genericSinglePromptChat } from "../../utils/openai";
import { callbackMDParagraphs } from "../../utils/md";
import { getJSONOrEmpty } from "../../utils/file";
import { transform } from "../../utils/prompt";
import { ScriptParseItem } from "../../types";
import { prompts } from "../../constants";

import { log } from "console";

enum ParseType {
	Atomistic = "atomistic",
	Holistic = "holistic",
}

const response_separator = {
	p: {
		name: "asterisk",
		symbol: "*",
	}
};

/**
 * The purpose of parse is to transform basic script paragraphs into a 'visualise' prompt and an 'animate' prompt. These
 * prompts are then used with their equivalent AI to generate media for the script, per paragraph/scene. This media is
 * ultimately a motion video/animation that aligns with the scene/paragraph.
 * 
 * @param items Basic parsed object with a type + content to map to a speech input object, or AI media-generation prompt.
 */
export const parse = async (name: string, items: ScriptParseItem[], indices?: string[], type = ParseType.Atomistic): Promise<PromptParseObject[]> => {
	switch (type) {
		default:
		// Holistic attempts to generate all the visualise and animate prompts by an AI consuming the whole story,
		// and attempting to be context aware throughout when generating the prompts per scene, increasing the
		// chances of a non-context-aware visual AI (like midjourney) generating more accurate depictions per scene
		// TODO: this does not consistently work and needs a refactor/fresh approach (too nondeterministic)
		case ParseType.Holistic: {
			const paragraphs: string[] = [];
			let story: string = "";

			await callbackMDParagraphs(items, async (value: ScriptParseItem) => {
				const { content } = value;
				paragraphs.push(content);
				story += `${content}${response_separator.p.symbol}`;
			});

			// Remove the last separator symbol as it's redundant
			story = story.slice(0, -1);

			const response = await genericSinglePromptChat([{
				"role": "user",
				"content": transform(prompts.story.make.abiotic.from.firstperson(response_separator.p.name), story)
			}]);

			const parsed_prompts = response
				?.split(response_separator.p.symbol)
				.filter(Boolean)
				.map((visualise: string, i: number) => ({
					speech: paragraphs[i],
					visualise,
					animate: "NA",
				})) as PromptParseObject[];

			// In case of any parsing errors, we check that every paragraph does in fact have an accompanying prompt
			if (paragraphs.length !== parsed_prompts.length) {
				throw new Error(`prompt count does not match paragraph count (paragraphs: ${paragraphs.length}; prompts: ${parsed_prompts.length}`);
			}

			return parsed_prompts;
		}

		// Atomistic, as the name implies, simply generates visualise and animate prompts per scene, without any
		// awareness of the over-arching story, or past scene/setup contexts by the AI; results, thus, may vary
		case ParseType.Atomistic: {
			const response: PromptParseObject[] = [];
			let prompts: any;

			await callbackMDParagraphs(items, async (value: ScriptParseItem, index) => {

				// Skip any indices not specifically requested by pushing what already exists in the prompts.json, if it exists
				if (indices && !indices.includes(index?.toString())) {
					prompts ||= getJSONOrEmpty(`./bin/prompt/${name}/prompts.json`);

					response[index] = {
						speech: prompts?.speech[index] || "NA",
						visualise: prompts?.visualise[index] || "NA",
						animate: "NA",
					} as PromptParseObject;

				} else {
					const { content: speech, params } = value;
					const { anim_type } = params || {};

					// Generate visualise prompt with openai
					const visualise = await getVisualPrompt(speech);

					// Generate animate prompt with openai
					// const animate = await getAnimPrompt(speech, anim_type);

					response[index] = {
						speech,
						visualise,
						animate: "NA",
					} as PromptParseObject;
				}

				// Log completion per scene
				log(`${name} scene ${index} prompt agnostic done`);

			});

			return response;
		}
	}
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

			// TODO: standardise more when we have a specific lib to use and know its argument format
			return `${movement} -camera ${camera}`;

		case AnimationPromptType.FromScratch:
			// TBD
			break;
	}
}