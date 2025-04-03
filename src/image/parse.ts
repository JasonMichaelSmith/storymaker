import { getJSON, getJSONOrEmpty, mkdirSync } from "../utils/file";
import { genDefaultImagineArgs } from "../utils/midjourney";
import { argsToString, truncate } from "../utils/misc";
import { Vendor } from "../types";

import * as bridge from "../bridge";

import { log } from "console";

import path from "path";
import fs from "fs";

/**
 * @note Prompts need to be already generated to get the right visualise prompt.
 * 
 * @note A results JSON needs to exist of URLs to reference relevant to the name as inputs for whatever image index is to be re-generated.
 * 		 This is hard-coded to enforce consistency in the way scene visuals are generated for a single story/name. You can manually pass
 * 		 your own results array of image URLs to ad-hoc patch-fix new image generations to any image reference available on the internet.
 * 
 * @note We can append `--iw 2` (0-2 range) for a different weight blend reference to the previous image.
 * @note We can append `--sw 100` (100 is default, 0 is off, 1000 is maximum) for a different style weight (will override the hard-coded weight).
 * @note We can append `--no, item1, item2, etc...` to remove things we don't want to be seen in the image.
 * @note We can append `--stylize 50` (100 is default) to effect how literal it takes the prompt (less is more literal).
 * @note We can append `--sref [URL]` to override the default style ref behaviour, but have to append other desirable defaults.
 * @note We can append `--style raw` to also effect how literal it takes the prompt.
 */
export const parse = async (
	name: string,
	index: number = 0,
	extra_args?: string,
	use_previous = false,
	results?: string[],
	vendor = Vendor.Midjourney
): Promise<void> => {
	const { visualise } = getJSON(`./bin/prompt/${name}/prompts.json`);

	const folder = mkdirSync(`./bin/image/${name}`);

	results ||= getJSONOrEmpty<string[]>(`${folder}/results.json`, []);

	// Default imagine args are only used if alternative args are not provided for more manual prompt imagine control
	let { previous, args } = genDefaultImagineArgs(index, results, extra_args);

	log(`imagining ${index}: ${argsToString([use_previous && previous, truncate(visualise[index]), args, extra_args])}`);

	let image;

	switch (vendor) {
		default:
		case Vendor.Midjourney:
			image = await bridge.goapi.gen(index, folder, argsToString([use_previous && previous, visualise[index], args, extra_args]));
			break;
	}

	// Change the results for the new image generated at the given index
	results[index] = image;

	// Re-write the change to the results JSON, or, create it for the first time
	await fs.promises.writeFile(path.resolve(`${folder}/results.json`), JSON.stringify(results));
}

const [, , name = "sample1", index, extra_args, use_previous, image_url_refs] = process.argv;

/**
 * @example `yarn image/parse sample1 0`
 * @example `yarn image/parse sample1 0 "--no ceiling lights, lanterns, candles"` (to append alernative ad-hoc args)
 * @example `yarn image/parse sample1 0 "" true` (to use previous image blend)
 * @example `yarn image/parse sample1 0 "" true test.com,test.com` (to use your own image url refs)
 */
parse(name, Number(index), extra_args, use_previous && JSON.parse(use_previous), image_url_refs?.split(","));