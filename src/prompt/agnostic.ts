import { getRandomArray, getRandomString } from "../utils/misc";
import { PromptParseObject, PromptType } from "../types/prompt";
import { getFilename, mkdirSync } from "../utils/file";
import { func } from "../utils/html";

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

const colour: Colour = {
	speech: "lightgrey",
	visualise: "lightblue",
	animate: "lightgreen",
};

/**
 * @param name Full filename + extension (e.g. "sample1.md").
 * @param input Body array params.
 */
export async function generate(name: string, input: PromptParseObject[]): Promise<void> {
	const folder = mkdirSync(`./bin/prompt/${getFilename(name)}`);
	const file = path.resolve(`${folder}/prompts.html`);

	let html = "";

	await Promise.all(input.map(async (x: PromptParseObject, i: number) => {
		html += `
			<div style="background-color: darkgrey; padding: ${padding.common}; margin-bottom: ${padding.common};">
				<h2 style="margin-top: 0;">Scene ${i + 1}</h2>
				${generateContentElement(i, PromptType.Speech, x)}
				${generateContentElement(i, PromptType.Visualise, x)}
				${generateContentElement(i, PromptType.Animate, x)}
			</div>
		`;
	}));

	html += func.copy;

	await fs.promises.writeFile(file, html);
}

const generateContentElement = (i: number, type: PromptType, input: PromptParseObject): string => `
	<p id="${i}-${type}" style="${styles.p} background-color: ${colour[type]};" onclick="copy('${i}-${type}')">${input[type]}</p>
`;

const [, , name] = process.argv;

/**
 * This is to test the prompt output without burning credits and AI compute/resources.
 * 
 * @example `yarn prompt/agnostic test` (yields result in `./bin/prompt/test/prompt.html`).
 */
if (name === "test") {
	generate(name, getRandomArray(() => ({
		speech: getRandomString(),
		visualise: getRandomString(),
		animate: getRandomString(),
	})));
}