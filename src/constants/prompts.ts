import { Direction } from "../types/prompt"

type AbioticDirection = {
	[key in Direction]: string
}

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
						move: AbioticDirection & { reveal: (what: string, direction: Direction) => string }
					}
				}
			}
		},
	}
}

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
							[Direction.Backward]: `pan backward in the image`,
							[Direction.Forward]: `pan forward in the image`,
							[Direction.Around]: `pan around the centre of the image`,
							[Direction.Right]: `pan to the right of the image`,
							[Direction.Left]: `pan to the left of the image`,

							reveal: (what: string | "nothing", direction: Direction) => {
								const { scene: { make: { animated: { from } } } } = prompts;

								switch (what) {
									case "nothing":
										return `${from.abiotic.move[direction]}, revealing more of the same`
									default:
										return `reveal a ${what} as we ${from.abiotic.move[direction]}`
								}
							}
						}
					}
				}
			}
		}
	}
}