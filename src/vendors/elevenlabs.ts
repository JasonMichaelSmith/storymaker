import dotenv from 'dotenv';

dotenv.config();

/**
 * @see https://elevenlabs.io/app/voice-lab
 * @note All these voices are proved to be viable and reliable, with no background white noise that's
 * 		 obvious when you have fade out cuts between scenes.
 */
const voice_lab = {
	male: {
		young: {
			american: {
				daniel: "Hv8mUtlN9ShzbFo2k5ki"
			}
		},
		middle: {
			american: {
				jack: "w0iwgZq3d7Gtt60j7VZ1"
			}
		},
		old: {
			british: {
				matthew: "A8kdTy0R3V3IV8hT8Q4v" // Note: volume needs to be slightly higher for this voice (double)
			}
		}
	},
	female: {
		young: {
			american: {
				madalyn: "BBdCJc154jggvWSeQhNx" // Note: volume needs to be slightly higher for this voice (double)
			}
		}
	}
};

/**
 * These are optimised defaults for the default `voice_id`.
 */
const voice_settings = {
	similarity_boost: 0.8,
	stability: 0.8,
	style: 0.0,
	use_speaker_boost: true
}

/**
 * These are just the optimal defaults you append to your HTTP request which you can override when parsing speech.
 * 
 * @see https://elevenlabs.io/docs/api-reference/text-to-speech
 * 
 * @note We're using `data` rather than `body` here because we're using `axios`.
 */
const elevenlabs = (text: string, voice_id = voice_lab.male.young.american.daniel) => ({
	defaults: {
		http: {
			url: `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
			method: 'post',
			headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
			data: {
				text,
				voice_settings
			}
		}
	}
});

export default elevenlabs;