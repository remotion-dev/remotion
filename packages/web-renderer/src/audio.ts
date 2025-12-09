import type {TRenderAsset} from 'remotion';

const TARGET_NUMBER_OF_CHANNELS = 2;
const TARGET_SAMPLE_RATE = 48000;

function mixAudio(waves: Int16Array[]) {
	if (waves.length === 1) {
		return waves[0];
	}

	const {length} = waves[0];

	const mixed = new Int16Array(length);

	for (let i = 0; i < length; i++) {
		const sum = waves.reduce((acc, wave) => acc + wave[i], 0);
		// Clamp to Int16 range
		mixed[i] = Math.max(-32768, Math.min(32767, sum));
	}

	return mixed;
}

export const onlyInlineAudio = (assets: TRenderAsset[]): AudioData | null => {
	const inlineAudio = assets.filter((asset) => asset.type === 'inline-audio');

	let duration: number | null = null;
	let length: number | null = null;
	for (const asset of inlineAudio) {
		if (asset.toneFrequency !== 1) {
			throw new Error(
				'Setting the toneFrequency is not supported yet in web rendering.',
			);
		}

		if (duration === null) {
			duration = asset.duration;
		} else if (duration !== asset.duration) {
			throw new Error('All inline audio must have the same duration');
		}

		if (length === null) {
			length = asset.audio.length;
		} else if (length !== asset.audio.length) {
			throw new Error('All inline audio must have the same length');
		}
	}

	if (duration === null || length === null) {
		return null;
	}

	const mixedAudio = mixAudio(
		inlineAudio.map((asset) => asset.audio as Int16Array),
	) as Int16Array<ArrayBuffer>;

	return new AudioData({
		data: mixedAudio,
		format: 's16',
		numberOfChannels: TARGET_NUMBER_OF_CHANNELS,
		numberOfFrames: inlineAudio[0].audio.length / TARGET_NUMBER_OF_CHANNELS,
		sampleRate: TARGET_SAMPLE_RATE,
		timestamp: inlineAudio[0].timestamp,
	});
};
