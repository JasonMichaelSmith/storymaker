import { SpeechParseObject } from "../types/vendors/openai";
import { getFilename, mkdirSync } from "../utils/file";
import { log } from "console";

import openai from "../vendors/openai";

import OpenAI from "openai";
import path from "path";
import fs from "fs";

type Params = OpenAI.Audio.Speech.SpeechCreateParams;

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
	const folder = mkdirSync(`./bin/speech/${getFilename(name)}`);
	const speechFile = path.resolve(`${folder}/speech-${i}.mp3`);

	const mp3 = await openai.audio.speech.create({
		...defaults,
		...body,
	});

	const buffer = Buffer.from(await mp3.arrayBuffer());
	await fs.promises.writeFile(speechFile, buffer);

	log(`${name} scene ${i} speech openai done`);
}

export async function generate(name: string, input: SpeechParseObject[]): Promise<void> {
	await Promise.all(input.map(async (x: SpeechParseObject, i: number) => await gen(name, x.body, i)));
}