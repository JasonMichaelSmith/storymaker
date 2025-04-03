import { Resolution } from "../types/video";
import { mkdirSync } from "../utils/file";
import { log, error } from "console";

import ffmpeg from "fluent-ffmpeg";

/**
 * Zoom creates an animated "zoom in" or "camera pan forward" motion on a still image turned into a video.
 * 
 * @param duration The zoom duration in seconds (should be the intended duration required of the video scene).
 * 
 * @note You should use a high-res image and a subtle zoom amount to avoid poor upscale resolution toward the end.
 * 
 * @important The `scale=8000x4000` factor is important to prevent jitteriness, as there's more pixels to
 * 			  round more precise x/y and interpolate pixels with between frames.
 */
export const zoom = async (
	name: string,
	index: number,
	location: string,
	duration = 10,
	videoCodec = "libx264",
	resolution = Resolution.FullHD,
	fps = 30,
): Promise<void> => {
	await new Promise<void>((resolve, reject) => {
		const output_dir = mkdirSync(`./bin/zoom/${name}`);
		const output = `${output_dir}/output-${index}.mp4`;
		ffmpeg(location)
			.inputOptions(`-framerate ${fps}`)
			.outputOptions('-vf', `scale=8000x4000,zoompan=z='min(zoom+0.0005,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${duration * fps},trim=duration=${duration}`)
			.outputOptions('-y') // Enable overwrite
			.outputOptions('-s', resolution)
			.output(output) // Output video path
			.videoCodec(videoCodec)
			.on('end', () => {
				log(`${output} zoomed for ${duration}s`);
				resolve();
			})
			.on('error', (err) => {
				error(err);
				reject();
			})
			.run();
	});
}