import { getFilename, mkdirSync } from "../utils/file";

import dotenv from 'dotenv';
import OpenAI from "openai";
import path from "path";
import fs from "fs";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.API_KEY });

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
}

export async function parse(name: string, input: Record<string, any>[]): Promise<void> {
	await Promise.all(input.map(async (x: Record<string, any>, i: number) => await gen(name, x.body, i)));
}