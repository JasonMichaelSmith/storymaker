import axios from "axios";
import fs from "fs";

export async function downloadImage(url: string, path: string): Promise<void> {
	try {
		const response = await axios({
			method: 'GET',
			url: url,
			responseType: 'stream', // Set responseType to 'stream' to handle binary data
		});

		// Create a writable stream to the file (path is dir + filename + extension)
		const writer = fs.createWriteStream(path);

		// Pipe the response stream to the file
		response.data.pipe(writer);

		// Return a promise that resolves when the file has been fully written
		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
	} catch (error) {
		throw new Error(`error downloading image: ${url}, ${JSON.stringify(error)}`);
	}
}