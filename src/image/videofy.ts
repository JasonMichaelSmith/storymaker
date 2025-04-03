import { getBulkMediaMetadata, readdir } from "../utils/file";
import { MediaFileType } from "../types/file";
import { fade } from "../constants/effects";
import { listify } from "../utils/misc";
import { zoom } from "../video/zoom";
import { Media } from "../types";

enum ImageVideofyType {
	Zoompan = "zoompan",
}

/**
 * @param name The name of the project to fetch the right assets from the `bin` folder.
 * 
 * @note This endpoint is intended to output final assets for production, hence we use the `final` folder.
 */
export const videofy = async (
	name: string,
	indices?: string[],
	delay = 0,
	type = ImageVideofyType.Zoompan,
	videoCodec = "libx264",
): Promise<void> => {
	const image: string[] = await readdir(getdir(Media.Image, name), [MediaFileType.PNG]);
	const audio: string[] = await readdir(getdir(Media.Audio, name), [MediaFileType.MP3]);
	const speech: string[] = await readdir(getdir(Media.Speech, name), [MediaFileType.MP3]);

	// Speech durations take precedence over audio or music tracks as they have to complete in full per image/videofy scene
	const speech_durations = await getBulkMediaMetadata<number[]>(
		getdir(Media.Speech, name), speech, (item: any) => item.format.duration
	);

	// Fetch misc audio durations if we have no speech, as we'll use that for a duration guide for each image/videofy scene
	const audio_durations = !speech_durations.length ? await getBulkMediaMetadata<number[]>(
		getdir(Media.Audio, name), audio, (item: any) => item.format.duration
	) : [];

	for (let i = 0; i < image.length; i++) {
		// Skip any indices not specifically requested
		if (indices && !indices.includes(i.toString())) {
			continue;
		}

		// Need to round up fractional durations to leave a little room for fractional speech/audio durations
		let duration = Math.ceil(speech_durations[i] || audio_durations[i] || 4);

		if (i === image.length - 1) {
			// Add an extra second of fade duration for the last video to leave room for the speech to finish (note: audio should fade out on stitch)
			duration += fade.duration;
		} else {
			// Add an extra fraction-second to all other scenes to allow for some breathing room after the speech stops (this is because the speech audios themselves don't leave a great enough pause)
			duration += fade.padding;
		}

		// Add an extra delay at the end if required
		duration += delay;

		switch (type) {
			default:
			case ImageVideofyType.Zoompan:
				await zoom(name, i, `${getdir(Media.Image, name)}/${image[i]}`, duration, videoCodec);
				break;
		}
	}
}

const getdir = (type: Media, name: string) => `./bin/${type}/${name}`;

const [, , name = "sample1", indices, delay] = process.argv;

/**
 * Examples
 * 
 * @example `yarn image/videofy`
 * @example `yarn image/videofy sample1 0` (target specific indices to redo a particular scene)
 * @example `yarn image/videofy sample1 0 1` (add an extra second to the end)
 */
videofy(name, listify(indices), delay ? Number(delay) : 0);