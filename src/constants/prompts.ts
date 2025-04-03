import { transform } from "../utils/prompt";
import { Language } from "../types";

/**
 * @note The "colon" we refer to in our prompts is added later with the simple {@link transform} function.
 */
export const prompts = {
	scene: {
		make: {
			abiotic: {
				from: {
					secondperson: `just describe what's in this scene, paying attention to real-world locations mentioned to gauge the aesthetic if applicable, with comma-separated adjectives, simple phrases, no more than 35 words, and describe the relative position and angle of where an invisible viewer in the scene is likely to be, but without a reference to a person; describe it with the simplest most visual-like language possible, to prompt an image-generator to paint the image as you describe it; imagine the image generated is for a picture book accompanying the paragraph I just gave you, so the visual description should accurately reflect exactly what the eyes of an invisible person standing in the scene would see; also, don't use words like "bare" or "stripped" or "crack" that could suggest a naked human being`
				}
			},
			animated: {
				from: {
					abiotic: {
						move: {
							generic: `create a comma-seperated list in this format: [noun] [verb] (don't include the brackets), of things that you would expect to see moving in this descriptively-written scene after the colon, if the scene was real life (for example, if you see a lake with gentle waves, a list item would be "water rippling")`
						}
					}
				}
			}
		}
	},
	story: {
		make: {
			abiotic: {
				from: {
					firstperson: (separator: string) => `absorb these paragraphs separated by an ${separator} symbol of a short story after the colon, and provide a visual prompt per paragraph for midjourney to visualise each paragraph as though it were a single scene in a picture book, labelling each with an ${separator} symbol; make sure that the scenes described will vividly prompt each visual midjourney makes to appear to progress through the objective world in the story, as if seen through the eyes of a human being moving through it, but the human is not visible, so don't use words that could draw a person or any part of their body in the scenes; finally, remember that each visual prompt midjourney has no prior context, so you'll have to re-establish the scene descriptively per paragraph as the hidden human moves through it, vividly re-describing everything that can be seen in the invisible human's entire field of view, not just the focal point, within the context of having transitioned from the previous paragraph; that means you should try to describe  where the invisible human or camera is in the scene; also, don't use words like "bare" or "stripped" that could suggest a naked human being`
				}
			}
		},
		edit: {
			evaluate: {
				spelling: (language = Language.BritishEnglish) => `perform basic spelling and grammar on all the text after the colon for the language code ${language}, and report back on any errors`
			}
		}
	},
	camera: {
		decide: {
			direction: `based on the descriptively-written actions of a person through this scene after the colon, if there was a camera that should portray what the person would be seeing out of their own eyes, how would you instruct the camera to move? If there is no person, then what camera motion would be best to move through, or zoom in on, a distinct feature in the scene? use this format (don't include the brackets): [action] [direction], (for example, if you saw text saying "you move toward the house", then you would naturally describe the camera to: pan forward)`
		}
	},
	visual: {
		ending: {
			ultrarealistic: `4k, 8k, photorealistic, unreal engine, octane render`
		}
	}
}