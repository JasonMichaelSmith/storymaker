import { PromptType } from "./prompt";

export type JSONPromptData = {
	[key in PromptType]: string[]
} & {
	summary: { length: { speech: { total: number, scenes: number[] } } }
}