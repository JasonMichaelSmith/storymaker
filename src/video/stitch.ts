import { Media, MediaOutputFinalType, MediaOutputSubtype, ScriptElement } from "../types";
import { getMediaMetadata, mkdirSync, readdir } from "../utils/file";
import { getMDScriptIndices } from "../utils/md";
import { MediaFileType } from "../types/file";
import { fade } from "../constants/effects";
import { listify } from "../utils/misc";
import { log, error } from "console";

import ffmpeg from "fluent-ffmpeg";
import path from "path";

const getdir = (type: Media | MediaOutputSubtype, name: string) => `./bin/${type}/${name}`;

const negation = "-1";

/**
 * @warning You *also* need to install the `ffmpeg` executable which the `fluent-ffmpeg` wraps
 * 			(e.g. `brew install ffmpeg` on macOS or "https://ffmpeg.org/download.html" for Windows).
 * 
 * @warning Every video has to be *exactly* the same size, frame rate, and ideally, the same initial codec too.
 */
export const stitch = async (
	name: string,
	indices?: string[],
	unify = true,
	videoType: Media.Video | MediaOutputSubtype.Zoom = MediaOutputSubtype.Zoom,
	audioCodec = "aac",
	videoCodec = "libx264",
): Promise<void> => {
	const folder = mkdirSync(`./bin/${MediaOutputFinalType.Stitched}/${name}`);

	const indir = {
		video: getdir(videoType, name),
		audio: getdir(Media.Audio, name),
		speech: getdir(Media.Speech, name),
		screens: getdir(MediaOutputSubtype.Screen, name),
	};

	// Get the script segment types and their indices to stitch screens and scenes together in the right order
	const script_indices = getMDScriptIndices(`./inputs/scripts/${name}.md`);

	// Videos are the core content scenes that make the story
	const video: string[] = await readdir(indir.video, [MediaFileType.MP4]);

	// Audio is optional, but if we do want to append extra audio alongside speech per scene, we do it here
	const audio: string[] = await readdir(indir.audio, [MediaFileType.MP3]);

	// Speech is also optional in parts, and based on the final media type, but is in every scene for narrated stories
	const speech: string[] = await readdir(indir.speech, [MediaFileType.MP3]);

	// Screens are additional scenes added that are typically just text for intros, outros, and intermissions
	const screens: string[] = await readdir(indir.screens, [MediaFileType.MP4]);

	// Store stiched scenes for later unification if required
	const scenes: string[] = [];

	for (let i = 0; i < script_indices.length; i++) {
		const { type, index } = script_indices[i];

		await new Promise<void>(async (resolve, reject) => {

			// Skip any indices not specifically requested
			if (indices && indices[0] != negation && !indices.includes(index.toString())) {
				resolve();
				return;
			}

			switch (type) {
				case ScriptElement.Heading:
					scenes.push(`${indir.screens}/${screens.shift()}`);
					resolve();
					break;

				case ScriptElement.Paragraph:
					const output = path.resolve(`${folder}/output-${index}.mp4`);
					scenes.push(output);

					// We can skip stitching individual scenes and proceed straight to merging the final output
					if (skipPerSceneStitch(indices)) {
						resolve();
						break;
					}

					const cmd = ffmpeg();
					const scene = video[index];

					cmd.input(`${indir.video}/${scene}`);

					// Fade in the first video scene (note that 'index' has a local count per type, so this would be 0 for a paragraph)
					if (index === 0) {
						cmd.videoFilters(`fade=t=in:st=0:d=${fade.duration}`);
					}

					// Fade out the last video scene (note the last video should pad some extra video so it doesn't fade too soon over speech)
					if (index === video.length - 1) {
						const video_metadata = await getMediaMetadata(`${indir.video}/${scene}`);
						cmd.videoFilters(`fade=t=out:st=${(video_metadata.format.duration || 0) - fade.duration - fade.padding}:d=${fade.duration}`);
					}

					// Append audio if available
					if (audio[index]) cmd.input(`${indir.audio}/${audio[index]}`);

					// Append speech if available
					if (speech[index]) cmd.input(`${indir.speech}/${speech[index]}`);

					// We use the speech metadata to decide when to fade out audio, which will also hit regular audio tracks, the speech duration being the arbiter
					const speech_metadata = await getMediaMetadata(`${indir.speech}/${speech[index]}`);

					// Complete merge for this individual scene
					cmd
						.audioCodec(audioCodec)
						.videoCodec(videoCodec)
						// Adjust volume as needed (default to 1, or simply remove if audio sources are at the right volume already)
						//.audioFilter(`volume=2`)
						// Add a fraction-second fade off for audio to smoothen over rough speech/audio ends in the file
						.audioFilter(`afade=t=out:st=${(speech_metadata.format.duration || 0) - fade.padding}:d=${fade.padding}`)
						.save(output)
						.on('end', () => {
							log(`${scene} ${MediaOutputFinalType.Stitched} with audio|speech`);
							resolve();
						})
						.on('error', (err) => {
							error(err);
							reject(err);
						});
					break;
			}
		});
	}

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

const skipPerSceneStitch = (indices?: string[]) => indices && indices[0] == negation;

const [, , name = "sample1", indices] = process.argv;

/**
 * Examples
 * 
 * @example `yarn video/stitch`
 * @example `yarn video/stitch sample1 0` (target specific indices to redo a particular scene)
 * @example `yarn video/stitch sample1 -1` (skip to unify; note that all scenes have to be stitched prior)
 */
stitch(name, listify(indices));