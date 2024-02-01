import { getFilename, mkdirSync } from "../utils/file";
import { PromptParseObject } from "../types/prompt";
import { func } from "../utils/html";

import path from "path";
import fs from "fs";

const styles = {
	p: `
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
	const file = path.resolve(`${folder}/prompts.html`);

	let html = "";

	await Promise.all(input.map(async (x: PromptParseObject, i: number) => {
		html += `<p id="${i}" style="${styles.p} background-color: lightgrey;" onclick="copy('${i}')">${x.speech}</p>`;
		html += `<p id="${i}" style="${styles.p} background-color: lightblue;" onclick="copy('${i}')">${x.visualise}</p>`;
		html += `<p id="${i}" style="${styles.p} background-color: lightgreen;" onclick="copy('${i}')">${x.animate}</p>`;
	}));

	html += func.copy;

	await fs.promises.writeFile(file, html);
}