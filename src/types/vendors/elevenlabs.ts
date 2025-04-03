export type SpeechParseBody = {
	text: string;
}

export type SpeechParseCustom = {
	voice_id?: string;
	model_id?: string;
};

export type SpeechParseObject = {
	custom?: SpeechParseCustom;
	body: SpeechParseBody;
}