import { SpeechParseObject } from "../types/vendors/openai";
import { getFilename, mkdirSync } from "../utils/file";
import { Media, Vendor } from "../types";
import { log } from "console";

import openai from "../vendors/openai";

import OpenAI from "openai";
import path from "path";
import fs from "fs";

type Params = OpenAI.Audio.Speech.SpeechCreateParams;

/**
 * @warning using `response_format: "aac"` made the speech worse; there was extra trailing and "click" sounds at
 * 			the end of the audio, and ffmpeg couldn't always accurately gauge the duration for the audio fade-off.
 */
const defaults = {
	model: "tts-1",
	voice: "onyx",
	input: "This is a default output.",
} as Params;

/**
 * @param name Full filename + extension (e.g. "sample1.md").
 * @param body Body params.
 * @param i Index.
 * 
 * @see https://platform.openai.com/docs/guides/text-to-speech?lang=node
 */
export async function gen(name: string, body?: Params, i = 0): Promise<void> {
	const folder = mkdirSync(`./bin/${Media.Speech}/${getFilename(name)}`);
	const speechFile = path.resolve(`${folder}/${Media.Speech}-${i}.mp3`);

	const mp3 = await openai.audio.speech.create({
		...defaults,
		...body,
	});

	const buffer = Buffer.from(await mp3.arrayBuffer());
	await fs.promises.writeFile(speechFile, buffer);

	log(`${name} scene ${i} ${Media.Speech} ${Vendor.OpenAI}  done`);
}

export async function generate(name: string, input: SpeechParseObject[]): Promise<void> {
	for (let i = 0; i < input.length; i++) {
		await gen(name, input[i].body, i);
	}
}