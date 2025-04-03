# Getting Started

- Run `yarn install`
- Get `ffmpeg` (https://ffmpeg.org/) or use `brew install ffmpeg` for macOS
- Create your `.env` file and fill in your API keys per AI provider required; they are: `OpenAI`, `GoAPI`

# Checking API Credits

- OpenAI: https://platform.openai.com/usage
- GoAPI: https://dashboard.goapi.ai/ (if using instead of Midjourney's official API)
- EleventLabs: https://elevenlabs.io/app/voice-lab

# Building a Story

Let's complete one of the sample stories from start to finish to get a feel for the core elements:

- See `readme-narrated-stills` for a _Narrated Stills_ generation guide

# AIs

## Midjourney

### Caveats

Note that the visualise prompts generated can run into problems with Midjourney's word filter. Even words like "bare" or "stripped" that can suggest a naked human body, are banned, regardless of context.

All known banned words to look for: `bare`, `stripped`, `naked`.

Also, phrases that suggest anything sexual or violent, can throw empty error objects without context.

### Image Style Reference

The default for generating images is to always reference the first image in the scene for stylising every subsequent scene. If the midjourney host expires for this, you can always host it yourself temporarily if you have the image locally, copy the full URL, and add it to a one-length array in `./bin/image/[YOUR_SCRIPT_NAME]/results.json`.
