import { transform } from "../utils/prompt";

type Prompts = {
	scene: {
		make: {
			abiotic: {
				from: {
					secondperson: string;
				}
			},
			animated: {
				from: {
					abiotic: {
						move: {
							[name: string]: any;
						}
					}
				}
			}
		},
	}
	camera: {
		decide: {
			direction: string;
		}
	}
}

/**
 * @note The "colon" we refer to in our prompts is added later with the simple {@link transform} function.
 */
export const prompts: Prompts = {
	scene: {
		make: {
			abiotic: {
				from: {
					secondperson: `just describe this scene without a reference to a person`
				}
			},
			animated: {
				from: {
					abiotic: {
						move: {
							generic: `create a comma-seperated list in this format: [noun] [verb], of things that you would expect to see moving in this descriptively-written scene after the colon, if this were real life (for example, if you see semi-rippling water, a list item would be "water rippling")`
						}
					}
				}
			}
		}
	},
	camera: {
		decide: {
			direction: `based on the descriptively-written actions of a person through this scene after the colon, if there was a camera that should portray what the person would be seeing out of their own eyes, how would you instruct the camera to move? use this format: [action] [direction], (for example, if you saw text saying "you move toward the house", then you would naturally describe the camera to: pan forward)`
		}
	}
}