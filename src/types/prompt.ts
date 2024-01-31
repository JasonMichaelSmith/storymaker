export type PromptParseObject = {
	/**
	 * This is the speech you hear (narration) for the object/scene.
	 */
	speech: string,
	/**
	 * This is a prompt derived from the speech to construct a visual still image of the scene.
	 */
	visualise: string,
	/**
	 * This is a prompt derived from the visual to construct an animated effect for the scene, bringing it to life.
	 */
	animate: string,
}