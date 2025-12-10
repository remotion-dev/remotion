import type {TRenderAsset} from 'remotion';

const TARGET_NUMBER_OF_CHANNELS = 2;
const TARGET_SAMPLE_RATE = 48000;

function mixAudio(waves: Int16Array[], length: number) {
	if (waves.length === 1) {
		return waves[0];
	}

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

	let length: number | null = null;
	for (const asset of inlineAudio) {
		if (asset.toneFrequency !== 1) {
			throw new Error(
				'Setting the toneFrequency is not supported yet in web rendering.',
			);
		}

		if (length === null) {
			length = asset.audio.length;
			// 1 frame offset may happen due to rounding, it is safe to truncate the last sample
		} else if (
			Math.abs(length - asset.audio.length) > TARGET_NUMBER_OF_CHANNELS
		) {
			throw new Error('All inline audio must have the same length');
		} else {
			length = Math.min(length, asset.audio.length);
		}
	}

	if (length === null) {
		return null;
	}

	const mixedAudio = mixAudio(
		inlineAudio.map((asset) => asset.audio as Int16Array),
		length,
	) as Int16Array<ArrayBuffer>;

	return new AudioData({
		data: mixedAudio,
		format: 's16',
		numberOfChannels: TARGET_NUMBER_OF_CHANNELS,
		numberOfFrames: length / TARGET_NUMBER_OF_CHANNELS,
		sampleRate: TARGET_SAMPLE_RATE,
		timestamp: inlineAudio[0].timestamp,
	});
};
