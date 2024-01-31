import fs from "fs";

export const getFilename = (path: string): string => path.split(".")[0];

export const mkdirSync = (folder: string, args?: Record<string, any>): string => {
	if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true, ...args });
	return folder;
};

export const readdir = async (dir: string, extensions?: string[]): Promise<string[]> => {
	return (await fs.promises.readdir(dir)).filter(x => extensions?.includes(x.split(".")[1]));
}