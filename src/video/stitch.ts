import { mkdirSync, readdir } from "../utils/file";
import { listify } from "../utils/misc";
import { log, error } from "console";

import ffmpeg from "fluent-ffmpeg";
import path from "path";

const indir = {
	video: './inputs/video',
	audio: './inputs/audio',
};

/**
 * @warning You *also* need to install the `ffmpeg` executable which the `fluent-ffmpeg` wraps
 * 			(e.g. `brew install ffmpeg` on macOS or "https://ffmpeg.org/download.html" for Windows).
 * 
 * @warning Every video has to be *exactly* the same size, frame rate, and ideally, the same initial codec too.
 */
export const stitch = async (
	indices?: string,
	audioCodec = "aac",
	videoCodec = "libx264",
	unify = true
): Promise<void> => {
	const folder = mkdirSync(`./bin/stitched`);

	const video: string[] = await readdir(indir.video, ["mp4"]);
	const audio: string[] = await readdir(indir.audio, ["mp3"]);

	const scenes: string[] = [];

	const targets = indices && listify(indices);

	await Promise.all(video.map(async (_, i) =>
		new Promise<void>((resolve, reject) => {
			const output = path.resolve(`${folder}/output-${i}.mp4`);
			scenes.push(output);

			// Skip any indices not specifically requested
			if (targets && !targets.includes(i.toString())) {
				resolve();
				return;
			}

			ffmpeg()
				.input(`${indir.video}/${video[i]}`)
				.input(`${indir.audio}/${audio[i]}`)
				.audioCodec(audioCodec)
				.videoCodec(videoCodec)
				.save(output)
				.on('end', () => {
					log(`${video[i]} + ${audio[i]} stitched`);
					resolve();
				})
				.on('error', (err) => {
					error(err);
					reject(err);
				});
		})
	));

	if (unify) {
		const ffmpegcmd = ffmpeg();

		scenes.map(x => ffmpegcmd.addInput(x));

		ffmpegcmd
			.audioCodec(audioCodec)
			.videoCodec(videoCodec)
			.mergeToFile(`${folder}/output-final.mp4`, './tmp')
			.on('end', () => log('unified'))
			.on('error', (err, stdout, stderr) => {
				error('unifying files:', err);
				error('stdout:', stdout);
				error('stderr:', stderr);
			});
	}
}

const [, , indices] = process.argv;

/**
 * Examples
 * 
 * @example `yarn video/stitch` (stitches everything in `/inputs/video|audio`).
 * @example `yarn video/stitch 0` (only stitches the first video/audio file before re-unifying).
 */
stitch(indices);