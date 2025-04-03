import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

export const getFilename = (path: string): string => path.split(".")[0];

export const getFile = (path: string): Buffer => fs.readFileSync(path);
export const getJSON = <T = Record<string, any>>(path: string): T => JSON.parse(getFile(path).toString());

export const getJSONOrEmpty = <T = Record<string, any>>(path: string, fallback?: any): T => {
	try {
		return getJSON<T>(path);
	} catch (error) {
		return fallback;
	}
};

export const mkdirSync = (folder: string, args?: Record<string, any>): string => {
	if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true, ...args });
	return folder;
};

export const readdir = async (dir: string, extensions?: string[]): Promise<string[]> => {
	return (
		(await fs.promises.readdir(mkdirSync(dir)))
			// Filter by interested extensions
			.filter(x => extensions?.includes(x.split(".")[1]))
			// Sort via the number portion of the filename by default
			.sort((a, b) => {
				// Extract the numeric part from each filename
				let numA = parseInt(a.match(/\d+/)?.[0] || "");
				let numB = parseInt(b.match(/\d+/)?.[0] || "");

				// Compare the numeric parts numerically
				return numA - numB;
			})
	);
}

export const remove = async (path: string): Promise<void> => {
	await fs.promises.unlink(path);
}

export const getMediaMetadata = async (path: string): Promise<ffmpeg.FfprobeData> => {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(path, (err, metadata) => {
			if (err) {
				console.error(err);
				reject(err);
			} else {
				resolve(metadata);
			}
		});
	});
}

export const getBulkMediaMetadata = async <T = ffmpeg.FfprobeData[]>(
	folder: string,
	files: string[],
	callback = (item: ffmpeg.FfprobeData) => item
): Promise<T> => {
	return Promise.all(files.map(async name => callback(await getMediaMetadata(`${folder}/${name}`)))) as T;
}

export async function downloadFile(path: string, data: any): Promise<void> {
	try {
		// Create a writable stream to the file (path is dir + filename + extension)
		const writer = fs.createWriteStream(path);

		// Pipe the response stream to the file
		data.pipe(writer);

		// Return a promise that resolves when the file has been fully written
		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
	} catch (error) {
		throw new Error(`error downloading file: ${path}, ${JSON.stringify(error)}`);
	}
}