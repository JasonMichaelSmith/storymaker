import { getJSON } from "../utils/json.mjs";

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.API_KEY });

async function gen(body, i) {
	const speechFile = path.resolve(`./bin/speech/speech-${i}.mp3`);

	const mp3 = await openai.audio.speech.create({
		model: "tts-1",
		voice: "onyx",
		input: "This is a sample output only.",
		...body
	});

	const buffer = Buffer.from(await mp3.arrayBuffer());
	await fs.promises.writeFile(speechFile, buffer);
}

const input = getJSON("./speech/input.json");

await Promise.all(input.map(async (x, i) => await gen(x.body, i)));
