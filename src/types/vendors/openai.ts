import OpenAI from "openai";

export type SpeechParseObject = {
	body: OpenAI.Audio.Speech.SpeechCreateParams
}