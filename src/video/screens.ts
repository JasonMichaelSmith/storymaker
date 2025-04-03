import { mkdirSync, remove } from "../utils/file";
import { transformHeading } from "../utils/text";
import { Resolution } from "../types/video";
import { fade } from "../constants/effects";
import { ScriptParseItem } from "../types";
import { getMDMeta } from "../utils/md";
import { listify } from "../utils/misc";
import { log, error } from "console";

import ffmpeg from "fluent-ffmpeg";

const fontFile = './assets/fonts/Times New Roman.ttf';

const fontSizes: { [key in Resolution]: number } = {
	[Resolution.HD]: 40,
	[Resolution.FullHD]: 60,
	[Resolution.QuadHD]: 120,
	[Resolution.UltraHD]: 240,
};

/**
 * Right now, screens are always 5 seconds to be paired with the empty 5-second audio track to resolve final stitch audio de-syncs.
 */
const duration = 5;

/**
 * Screens are simply scene swith a solid background and single-line text.
 * 
 * Used for introductions, intermissions, and conclusions which require text on screen.
 * Read from the headings in a script markdowns, and indexed according to where they
 * appear in amongst other text blocks and paragraphs.
 */
export const screens = async (
	name: string,
	indices?: string[],
	resolution = Resolution.FullHD,
	fontColor: string = 'white'
): Promise<void> => {
	const script = getMDMeta(`./inputs/scripts/${name}.md`);
	const output_dir = mkdirSync(`./bin/screen/${name}`);
	const headings = getHeadings(script);

	const fontSize = fontSizes[resolution];

	for (let i = 0; i < headings.length; i++) {
		const output_temp = `${output_dir}/screen-${i}-temp.mp4`;

		// Skip any indices not specifically requested
		if (indices && !indices.includes(i.toString())) {
			continue;
		}

		await new Promise<void>((resolve, reject) => {
			ffmpeg()
				.complexFilter([
					`color=size=${resolution}:duration=${duration}:rate=25:color=black[bg]`,
					`[bg]drawtext=fontfile=${fontFile}:fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=(h-text_h)/2:text='${headings[i]}'`
				])
				// This is a workaround to prevent the audio of the scenes shifting down into these silent screens when stitched
				.input(`./assets/audio/empty-${duration}s.mp3`)
				.output(output_temp)
				.on('end', () => {
					log(`${i} screen made with: ${headings[i]}`);
					resolve();
				})
				.on('error', (err) => {
					error('error creating video:', err);
					reject(err);
				})
				.run();
		});

		// Subsequent ffmpeg command to add fade-in and fade-out effects
		const output = `${output_dir}/screen-${i}.mp4`;

		await new Promise<void>((resolve, reject) => {
			ffmpeg()
				.input(output_temp)
				.videoFilters(`fade=t=in:st=0:d=${fade.duration}`)
				.videoFilters(`fade=t=out:st=${(duration - fade.padding) - fade.duration}:d=${fade.duration}`)
				.output(output)
				.on('end', () => {
					resolve();
				})
				.on('error', (err) => {
					error('Error creating final video:', err);
					reject(err);
				})
				.run();
		});

		// Remove temp file
		remove(output_temp);
	}
}

const getHeadings = (items: ScriptParseItem[]): string[] => {
	let last_type: string = "";
	const headings: string[] = [];

	items.map((item: ScriptParseItem) => {
		if (last_type === "heading_open") {
			headings.push(transformHeading(item.content));
		}
		last_type = item.type;
	});

	return headings;
}

const [, , name = "sample1", indices] = process.argv;

/**
 * Examples
 * 
 * @example `yarn video/screens`
 * @example `yarn video/screens sample1 0` (target specific indices to redo a particular screen)
 */
screens(name, listify(indices));