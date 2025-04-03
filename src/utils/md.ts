import { ScriptElement, ScriptItem, ScriptParseItem } from "../types";

import mdi from "markdown-it";
import fs from "fs";

export const getMDMeta = (path: string) => {
	const data = fs.readFileSync(path, "utf-8");
	return mdi().parse(data, {});
}

export const getMDPlainText = (path: string): string => {
	const data = fs.readFileSync(path, "utf-8");
	return data.replace(/[#*_`>\[\]]/g, '');
}

export const getMDScriptIndices = (path: string): ScriptItem[] => {
	const script: ScriptParseItem[] = getMDMeta(path);
	const indices: ScriptItem[] = [];

	let h_index = 0;
	let p_index = 0;

	script.map((item: ScriptParseItem) => {
		const { type } = item;

		if (item.type === ScriptElement.Heading) {
			indices.push({ type, index: h_index });
			h_index++;
		}
		if (item.type === ScriptElement.Paragraph) {
			indices.push({ type, index: p_index });
			p_index++;
		}
	});

	return indices;
}

export const callbackMDParagraphs = async (
	items: ScriptParseItem[],
	callback: (value: ScriptParseItem, index: number) => Promise<void>,
	async_op: boolean = true
): Promise<void> => {
	let last_type: string = "";

	for (let i = 0, j = 0; i < items.length; i++) {
		const x = items[i];
		const { type } = x;

		if (last_type === ScriptElement.Paragraph && x.type === "inline") {
			if (async_op) {
				await callback(x, j);
			} else {
				callback(x, j);
			}
			j++;
		}

		last_type = type;
	}
}