export async function read_audio(url: string | URL, sampling_rate: number) {
	if (typeof AudioContext === 'undefined') {
		// Running in node or an environment without AudioContext
		throw Error(
			'Unable to load audio from path/URL since `AudioContext` is not available in your environment. ' +
				'Instead, audio data should be passed directly to the pipeline/processor. ' +
				'For more information and some example code, see https://huggingface.co/docs/transformers.js/guides/node-audio-processing.',
		);
	}

	const response = await (await fetch(url)).arrayBuffer();
	const audioCTX = new AudioContext({sampleRate: sampling_rate});
	if (typeof sampling_rate === 'undefined') {
		console.warn(
			`No sampling rate provided, using default of ${audioCTX.sampleRate}Hz.`,
		);
	}

	const decoded = await audioCTX.decodeAudioData(response);

	/** @type {Float32Array} */
	let audio;

	// We now replicate HuggingFace's `ffmpeg_read` method:
	if (decoded.numberOfChannels === 2) {
		// When downmixing a stereo audio file to mono using the -ac 1 option in FFmpeg,
		// the audio signal is summed across both channels to create a single mono channel.
		// However, if the audio is at full scale (i.e. the highest possible volume level),
		// the summing of the two channels can cause the audio signal to clip or distort.

		// To prevent this clipping, FFmpeg applies a scaling factor of 1/sqrt(2) (~ 0.707)
		// to the audio signal before summing the two channels. This scaling factor ensures
		// that the combined audio signal will not exceed the maximum possible level, even
		// if both channels are at full scale.

		// After applying this scaling factor, the audio signal from both channels is summed
		// to create a single mono channel. It's worth noting that this scaling factor is
		// only applied when downmixing stereo audio to mono using the -ac 1 option in FFmpeg.
		// If you're using a different downmixing method, or if you're not downmixing the
		// audio at all, this scaling factor may not be needed.
		const SCALING_FACTOR = Math.sqrt(2);

		const left = decoded.getChannelData(0);
		const right = decoded.getChannelData(1);

		audio = new Float32Array(left.length);
		for (let i = 0; i < decoded.length; ++i) {
			audio[i] = (SCALING_FACTOR * (left[i] + right[i])) / 2;
		}
	} else {
		// If the audio is not stereo, we can just use the first channel:
		audio = decoded.getChannelData(0);
	}

	return audio;
}
