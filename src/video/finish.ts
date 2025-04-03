import { getMediaMetadata, mkdirSync } from "../utils/file";
import { MediaOutputFinalType } from "../types";
import { Resolution } from "../types/video";
import { output } from "../constants/file";
import { listify } from "../utils/misc";
import { log, error } from "console";

import ffmpeg from "fluent-ffmpeg";

enum FinishType {
	Sound = "sound",
	Filter = "filter",
	Overlay = "overlay",
}

enum SoundType {
	Ambience = "ambience",
}

enum OverlayType {
	Rain = "rain",
	Dirt = "dirt",
	Flicker = "flicker",
	OldFilmGrain = "old-film-grain",
	smallParticles = "small-particles",
	AbstractLightLeaks = "abstract-light-leaks",
}

export const finish = async (
	inputs: string,
	type: FinishType,
	content: string,
	...args: string[]
): Promise<void> => {
	const name = listify(inputs)![0];
	const index = listify(inputs)![1];

	const folder = mkdirSync(`./bin/${MediaOutputFinalType.Stitched}/${name}`);

	const reference = `${output.prefix}-${index || output.final}`;
	const output_file = `${folder}/${reference}-with-${type}.mp4`;
	const content_video = `${folder}/${reference}.mp4`;

	const cmd = ffmpeg();

	switch (type) {
		// TODO: can be any sound for single scenes
		default:
		case FinishType.Sound: {
			content ||= SoundType.Ambience;

			const audioFile = `./assets/audio/${content}.mp3`;

			cmd
				.input(content_video)
				.input(audioFile)
				.complexFilter('amix=inputs=2:duration=longest')
				.videoCodec('copy')
				.audioCodec('copy')
				.outputOptions('-shortest') // Set to use the shortest duration of inputs (ambience has to play longer than video)
				.output(output_file)
				.on('end', () => {
					log(`${name} finished for ${type}.${content}`);

				})
				.on('error', (err) => {
					error('Error creating final video:', err);
				})
				.run();

			break;
		}

		case FinishType.Filter: {
			// TBD
			break;
		}

		case FinishType.Overlay: {
			content ||= OverlayType.Dirt;

			const opacity = args?.[0] || 0.25;
			const resolution = args?.[1] || Resolution.FullHD;

			const overlay_video = `./assets/${FinishType.Overlay}/${content}-${resolution}.mp4`;

			const { format: { duration: overlay_duration } } = await getMediaMetadata(overlay_video) as { format: { duration: number } };
			const { format: { duration: content_duration } } = await getMediaMetadata(content_video) as { format: { duration: number } };

			const loops = Math.ceil(content_duration / overlay_duration);

			cmd
				.input(overlay_video)
				.inputOptions(`-stream_loop ${loops}`) // Loop overlay enough times to fill the content video
				.input(content_video)
				.videoCodec('copy')
				.audioCodec('copy')
				.complexFilter(`[0]format=rgba,colorchannelmixer=aa=${opacity}[fg];[1][fg]overlay[out]`)
				.outputOptions('-map [out]')
				.outputOptions('-map 1:a') // Map audio stream from input file 2 (otherwise we lose audio)
				.outputOptions('-pix_fmt yuv420p')
				.outputOptions('-c:v libx264')
				.outputOptions('-crf 18')
				.outputOptions(`-t ${content_duration}`) // Set output duration to match content otherwise it'll play to the end of the last overlay loop that bleeds over
				.output(output_file)
				.on('end', () => {
					log(`${name} finished for ${type}.${content}`);
				})
				.on('error', (err) => {
					error('Error creating final video:', err); // TODO: standardise generic error message + response
				})
				.run();
		}
	}
}

const [, , inputs = "sample1", type = FinishType.Sound, content, ...rest] = process.argv;

/**
 * Examples
 * 
 * @example `yarn video/finish`
 * @example `yarn video/finish sample1`
 * @example `yarn video/finish sample1 sound`
 * @example `yarn video/finish sample1 overlay` (the whole final output)
 * @example `yarn video/finish sample1,14 overlay` (just stitched scene 14 - defaults to `OverlayType.Dirt` effect)
 * @example `yarn video/finish sample1,14 overlay flicker` (just stitched scene 14 and use the flicker effect)
 */
finish(inputs, type as FinishType, content, ...rest);