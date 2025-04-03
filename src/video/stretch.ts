import { mkdirSync } from "../utils/file";
import { log, error } from "console";

import ffmpeg from "fluent-ffmpeg";

/**
 * Stretch makes the video longer per the required duration. This is typically used
 * to ensure "some" motion in a video is visible whilst an audio overlay is playing,
 * and the audio overlay is longer than the initially-generated video.
 * 
 * @warning Stretching should only be minimal, as we're using the same amount of
 * 			frames, so too much stretching will make it "stagger".
 * 
 * @param location The full folder path + file name + extension of the video to stretch.
 * @param duration The seconds to stretch the video too (should be a whole number).
 */
export const stretch = async (index: number, location: string, duration: number): Promise<void> => {
	await new Promise<void>((resolve, reject) => {
		// Calculate the current duration of the input video
		ffmpeg.ffprobe(location, (err, metadata) => {
			if (err) {
				error('error getting video metadata:', err);
				return;
			}
			// Get current duration
			const currentDuration = metadata.format.duration || 0;

			// Calculate the factor by which to slow down the video
			const slowDownFactor = duration / currentDuration;

			// We can't do overwrites, so we always dump the stretched video in the bin folder
			const output_dir = mkdirSync(`./bin/stretched`);
			const output = `${output_dir}/output-${index}.mp4`;

			// Execute ffmpeg command to slow down the video
			ffmpeg(location)
				.outputOptions('-vf', `setpts=${slowDownFactor}*PTS`) // Apply setpts filter to the video stream
				.output(output)
				.outputOptions('-y') // Enable overwrite
				.on('end', () => {
					log(`${output} extended to ${duration}s`);
					resolve();
				})
				.on('error', (err) => {
					error(err);
					reject();
				})
				.run();
		});
	});
}