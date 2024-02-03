// TODO: for consideration for midjourney
export const image = `IMAGE: 3D Art | STYLE: Steampunk | COLOR THEME: Brass and Victorian | CHARACTER: [character description] | ENGINE: Unreal Engine 5 | TECHNICAL: 8K resolution, HDR, high quality, high detail | MATERIAL: bronze and silver --ar 16:9 --s 750 --v 6.0`

// TODO: move to type
export enum Characteristic {
	Image = "IMAGE",
	Style = "STYLE",
	ColorTheme = "COLOR THEME",
	Character = "CHARACTER",
	Engine = "ENGINE",
	Technical = "TECHNICAL",
	Material = "MATERIAL",
	IMAGE = "IMAGE",
}

export const lexicon: { [key in Characteristic]?: any } = {
	[Characteristic.Image]: {
		art3d: "3D Art",
	}
}