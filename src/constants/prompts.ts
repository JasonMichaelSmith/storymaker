// TODO: move to types
export enum Direction {
	Backward = "backward",
	Forward = "forward",
	Around = "around",
	Right = "right",
	Left = "left",
}

type AbioticDirection = {
	[key in Direction]: string
}

export const prompts: {
	scene: {
		make: {
			abiotic: {
				from: Record<string, any>
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
} = {
	scene: {
		make: {
			abiotic: {
				from: {
					secondperson: `just describe the scene without any reference to a person`
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
								switch (what) {
									case "nothing":
										return `${prompts.scene.make.animated.from.abiotic.move[direction]}, revealing more of the same`
									default:
										return `reveal a ${what} as we ${prompts.scene.make.animated.from.abiotic.move[direction]}`
								}
							}
						}
					}
				}
			}
		}
	}
}