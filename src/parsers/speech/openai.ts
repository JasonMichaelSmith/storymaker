export const parse = (items: any[]): any[] => {
	return items
		.map((x) => {
			// Paragraph
			if (x.type === "inline") {
				return {
					body: {
						model: "tts-1",
						voice: "onyx",
						input: x.content,
					},
				};
			}
		})
		.filter(Boolean);
};