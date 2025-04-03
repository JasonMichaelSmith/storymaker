# Narrated Stills

Narrated Stills is the easiest story format to parse into video, as it creates only stills and speech narration.

## Tips

Try just running `yarn image/parse [SCRIPT_NAME_HERE] 0` first to see if you like the first image of your story, because every image after that will be stylised after it, so you want to make sure you like the first to not waste credits generating the rest with the wrong style!

## Sample 1

In `inputs/sample1.md`. To start, run the prompt generator:

- Run `yarn scripts/spelling sample1` to check for spelling and grammar
- Run `yarn scripts/parse sample1 speech` to create speech narration files (and/or append a specific voice id for elevenlabs like this: `yarn scripts/parse sample1 speech elevenlabs A8kdTy0R3V3IV8hT8Q4v`)
- Run `yarn scripts/parse sample1 prompt` to create the prompts for visualise and animate + prompt review output html/json
- Review the prompts at `./bin/prompt/sample1/` per scene to see if they look okay before running media generation

From here you can go in two directions: autopilot or one-at-a-time.

### Autopilot

Generates all images for every scene, always using index `1` for 4 variants rendered per scene. This is riskier but quicker, as you can leave it going till completion, but some images might be poor, or a series of images might be too wrong, which means you have to go back and regenerate the ones that are wrong, costing money/credits.

- Run `yarn scripts/parse sample1 image` to create the still images per scene from the visualise prompts created above
- Pause to assess a few scene images for consistent styling and progress

### One-At-A-Time

With this approach you only generate one scene at a time, review it, approve it, and allow the x2 upscale to complete. This is safer from a creative perspective, as you won't waste credits on upscales, but will only waste credits on the initial generation if none of the 4 (assuming 4 variants from an `imagine` prompt with Midjourney or similar) are to your liking.

- Run `yarn image/parse sample1 0`, review, approve
- Run `yarn image/parse sample1 1`, review, approve
- Run `yarn image/parse sample1 2`, review, approve
- etc... till all scene images are generated

See further below too for extra commands you can add to manually adjust the change the prompt will generate the image you want, like using `--no items` or adjusting the style reference weight with `--sw 10`.

### Final Commands

Once you have all scene images and speeches, you just have to add some motion, generate the text screens, and stitch it all together:

- Run `yarn image/videofy sample1` to generate motion videos of the scene images (note: you need to have the speeches first for length)
- Run `yarn video/screens sample1` to generate the screens
- Run `yarn video/stitch sample1` to stitch everything together, and produce the final output

## Don't Like The Outputs?

The outputs can vary each time, so you may want to re-run them all, or just re-run one or more scenes in particular that didn't come out as good, or have recently been added.

- For instance, run `yarn speech/parse sample1 0` (just re-do the speech generation of the first scene; and/or append a specific voice id for elevenlabs like this: `yarn speech/parse sample1 0 A8kdTy0R3V3IV8hT8Q4v`)
- Or, to re-generate one of the images, run `yarn image/parse sample1 0` (0 being index `0` which means the first)
- Or, to re-generate one of the prompts, even if just progressing with new paragraphs added, run `yarn scripts/parse sample1 prompt openai 5` (start at paragraph 5 from 0)
- Or, edit the `./bin/prompt/sample1/prompts.json`

### Items Appearing You Don't Want

- Re-generate one of the images and add the items you don't want to appear like so: `yarn image/parse sample1 0 "--no ceiling lights, lanterns, candles"`
- And/or, manually modify the imagine prompt generated for your present index to get a better result: `./bin/prompt/sample1/prompts.json`

### Items Not Taking Your Prompt Literally Enough

- Try lowering the stylisation until you get an item that takes your prompt more literally (100 is default): `yarn image/parse sample1 0 --stylize 10`
- And/or, manually modify the imagine prompt generated for your present index to get a better result: `./bin/prompt/sample1/prompts.json`
- Try to remove the style reference weight entirely: `yarn image/parse sample1 1 "--sw 0 --stylize 0"`
- Try `--style raw` (see: https://docs.midjourney.com/docs/style)

### Want to Change the Default Style Reference?

- Reference any image on the web, or pull one from the `.bin/image/sample1/result.json` and override with the arg: `yarn image/parse sample1 14 "--sref https://img.midjourneyapi.xyz/mj/beb2aa10-cb73-4a6c-b802-c4b1b9aabc1c.png"`

### Other Re-Prompts Thereafter

- Or, to re-generate one of the images and use a previous result, run `yarn image/parse sample1 1 "" true`
- Or, to generate via the autopilot image script parse from a given point to the end, run `yarn scripts/parse sample1 image midjourney 1`
- After that, you may want to create a re-zoom or videofication of that image, run `yarn image/videofy sample1 0`
- After that, you may want to re-stich a video + speech together again to assess the final output: `yarn video/stitch sample1 1`
