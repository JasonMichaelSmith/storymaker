export enum PromptType {
	Speech = "speech",
	Visualise = "visualise",
	Animate = "animate",
}

export type PromptParseObject = {
	/**
	 * This is the speech you hear (narration) for the object/scene.
	 */
	[PromptType.Speech]: string,
	/**
	 * This is a prompt derived from the speech to construct a visual still image of the scene.
	 */
	[PromptType.Visualise]: string,
	/**
	 * This is a prompt derived from the visual to construct an animated effect for the scene, bringing it to life.
	 */
	[PromptType.Animate]: string,
}

export enum Direction {
	Backward = "backward",
	Forward = "forward",
	Around = "around",
	Right = "right",
	Left = "left",
}

export enum AnimationPromptType {
	WithImage = "with_image",
	FromScratch = "from_scratch",
}