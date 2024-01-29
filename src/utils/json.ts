import fs from "fs";

export const getJSON = (path: string) => {
	const data: Buffer = fs.readFileSync(path);
	return JSON.parse(data.toString());
}