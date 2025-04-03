import { AnimationPromptType } from "./prompt";

export * as midjourney from "./midjourney";

export * from "./vendors";
export * from "./media";

export enum Paradigm {
	Prompt = "prompt"
}

export type ScriptParseItem = {
	type: string,
	content: string,
	params?: { anim_type: AnimationPromptType }
}

export type ScriptItem = { type: string, index: number }

/**
 * @note This is for the npm lib `markdown-it` specifically.
 */
export enum ScriptElement {
	Heading = "heading_open",
	Paragraph = "paragraph_open",
}

export enum Language {
	BritishEnglish = "en-gb"
}