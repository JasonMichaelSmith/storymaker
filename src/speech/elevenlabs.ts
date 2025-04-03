import { downloadFile, getFilename, mkdirSync } from "../utils/file";
import { SpeechParseObject } from "../types/vendors/elevenlabs";
import { Media, Vendor } from "../types";
import { log } from "console";

import elevenlabs from "../vendors/elevenlabs";

import axios from "axios";
import path from "path";

/**
 * @see https://elevenlabs.io/docs/api-reference/text-to-speech
 */
export async function gen(name: string, props: SpeechParseObject, i = 0): Promise<void> {
	const folder = mkdirSync(`./bin/${Media.Speech}/${getFilename(name)}`);
	const speechFile = path.resolve(`${folder}/${Media.Speech}-${i}.mp3`);

	const config = elevenlabs(props.body.text, props.custom?.voice_id).defaults.http;
	const response = await axios<any>({
		responseType: "stream",
		...config,
	}) as any;

	await downloadFile(speechFile, response.data);

	log(`${name} scene ${i} ${Media.Speech} ${Vendor.ElevenLabs} done`);
}

export async function generate(name: string, input: SpeechParseObject[]): Promise<void> {
	for (let i = 0; i < input.length; i++) {
		await gen(name, input[i], i);
	}
}