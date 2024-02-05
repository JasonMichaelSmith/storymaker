import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

export const getFilename = (path: string): string => path.split(".")[0];

export const getFile = (path: string): Buffer => fs.readFileSync(path);
export const getJSON = (path: string): Record<string, any> => JSON.parse(getFile(path).toString());

export const mkdirSync = (folder: string, args?: Record<string, any>): string => {
	if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true, ...args });
	return folder;
};

export const readdir = async (dir: string, extensions?: string[]): Promise<string[]> => {
	return (await fs.promises.readdir(dir)).filter(x => extensions?.includes(x.split(".")[1]));
}

export const getMediaMetadata = async (file: string): Promise<ffmpeg.FfprobeData> => {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(file, (err, metadata) => {
			if (err) {
				console.error(err);
				reject(err);
			} else {
				resolve(metadata);
			}
		});
	});
}