import mdi from "markdown-it";
import fs from "fs";

export const getMDMeta = (path: string) => {
	const data = fs.readFileSync(path, "utf-8");
	return mdi().parse(data, {});
}