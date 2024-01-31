import { getFilename, mkdirSync } from "../utils/file";
import { PromptParseObject } from "../types/prompt";
import { func } from "../utils/html";

import path from "path";
import fs from "fs";

const styles = {
	p: `
		background-color: lightgrey;
		font-family: Arial;
		cursor: pointer;
		padding: 10;
	`,
};

/**
 * @param name Full filename + extension (e.g. "sample1.md").
 * @param input Body array params.
 */
export async function generate(name: string, input: PromptParseObject[]): Promise<void> {
	const folder = mkdirSync(`./bin/prompt/${getFilename(name)}`);
	const promptFile = path.resolve(`${folder}/prompts.html`);

	let html = "";

	await Promise.all(input.map(async (x: PromptParseObject, i: number) => {
		html += `<p id="${i}" style="${styles.p}" onclick="copy('${i}')">${x.speech}</p>`;
		html += `<p id="${i}" style="${styles.p}" onclick="copy('${i}')">${x.visualise}</p>`;
		html += `<p id="${i}" style="${styles.p}" onclick="copy('${i}')">${x.animate}</p>`;
	}));

	html += func.copy;

	await fs.promises.writeFile(promptFile, html);
}