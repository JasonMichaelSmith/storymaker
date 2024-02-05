import { getRandomArray, getRandomString, roundUp, secondsToHHMMSS } from "../utils/misc";
import { PromptParseObject, PromptType } from "../types/prompt";
import { getMediaMetadata, mkdirSync } from "../utils/file";
import { JSONPromptData } from "../types/json";
import { func } from "../utils/html";
import { Media } from "../types";

import path from "path";
import fs from "fs";

const padding = {
	common: "10px"
};

const styles = {
	p: `
		font-family: Arial;
		cursor: pointer;
		padding: ${padding.common};
	`,
};

type Colour = {
	[key in PromptType]: string
}

type SpeechMetadata = {
	format: { duration?: number | undefined }
}

const S = PromptType.Speech;
const V = PromptType.Visualise;
const A = PromptType.Animate;

const colour: Colour = {
	[S]: "lightgrey",
	[V]: "lightblue",
	[A]: "lightgreen",
};

/**
 * @param name Name of the story (e.g. "sample1" for one of the samples).
 * @param input Body array params.
 */
export async function generate(name: string, input: PromptParseObject[]): Promise<void> {
	const folder = mkdirSync(`./bin/prompt/${name}`);

	const html_file = path.resolve(`${folder}/prompts.html`);
	const json_file = path.resolve(`${folder}/prompts.json`);

	let html = "";

	let json: JSONPromptData = {
		[S]: [],
		[V]: [],
		[A]: [],

		summary: {
			length: {
				speech: {
					total: 0,
					scenes: []
				}
			}
		}
	};

	async function processInputSequentially(input: PromptParseObject[]) {
		for (let i = 0; i < input.length; i++) {
			const x = input[i];
			const speech_metadata = await getSpeechMetadata(name, i);

			json[S].push(x[S]);
			json[V].push(x[V]);
			json[A].push(x[A]);

			const time = speech_metadata.format.duration || 0;

			json.summary.length.speech.total += time;
			json.summary.length.speech.scenes.push(time);

			html += `
				<div style="background-color: darkgrey; padding: ${padding.common}; margin-bottom: ${padding.common};">
					<h2 style="margin-top: 0;">Scene ${i + 1}</h2>
					${generateContentElement(i, S, x)}
					${generateContentElement(i, V, x)}
					${generateContentElement(i, A, x)}
					${generateMetadata(speech_metadata)}
				</div>
			`;
		}
	}

	await processInputSequentially(input);

	html += generateSummary(json);
	html += func.copy;

	await fs.promises.writeFile(html_file, html);
	await fs.promises.writeFile(json_file, JSON.stringify(json));
}

const generateContentElement = (i: number, type: PromptType, input: PromptParseObject): string => `
	<p id="${i}-${type}" style="${styles.p} background-color: ${colour[type]};" onclick="copy('${i}-${type}')">${input[type]}</p>
`;

const generateMetadata = (metadata: SpeechMetadata): string => {
	const { duration } = metadata.format;

	return `
		<p>Speech Duration: ${duration}s</p>
		<p>Video Duration 3s: ${roundUp(duration, 3)}s</p>
		<p>Video Duration 4s: ${roundUp(duration, 4)}s</p>
	`;
};

const generateSummary = (json: JSONPromptData): string => {
	const { total } = json.summary.length.speech;

	return `
		<div>
			<h2>Summary</h2>
			<p>Total Speech Time: ${secondsToHHMMSS(total)}</p>
			<p>Total Video Duration 3s: ${secondsToHHMMSS(roundUp(total, 3))}s</p>
			<p>Total Video Duration 4s: ${secondsToHHMMSS(roundUp(total, 4))}s</p>
		</div>
	`;
};

const getSpeechMetadata = async (name: string, i: number): Promise<SpeechMetadata> => {
	const speech = path.resolve(`./bin/${Media.Speech}/${name}/${Media.Speech}-${i}.mp3`);
	return await getMediaMetadata(speech);
};

const [, , name] = process.argv;

/**
 * This is to test the prompt output without burning credits and AI compute/resources.
 * 
 * @example `yarn prompt/agnostic test` (yields result in `./bin/prompt/test/prompt.html`).
 */
if (name === "test") {
	generate(name, getRandomArray(() => ({
		[S]: getRandomString(),
		[V]: getRandomString(),
		[A]: getRandomString(),
	})));
}