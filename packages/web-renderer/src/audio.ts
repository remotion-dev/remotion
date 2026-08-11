import type {TRenderAsset} from 'remotion';

const TARGET_NUMBER_OF_CHANNELS = 2;

function mixAudio(waves: Int16Array[], length: number) {
	if (waves.length === 0) {
		return new Int16Array(length);
	}

	if (waves.length === 1 && waves[0].length === length) {
		return waves[0];
	}

	const mixed = new Int16Array(length);

	if (waves.length === 1) {
		mixed.set(waves[0].subarray(0, length));
		return mixed;
	}

	for (let i = 0; i < length; i++) {
		const sum = waves.reduce((acc, wave) => {
			return acc + (wave[i] ?? 0);
		}, 0);
		// Clamp to Int16 range
		mixed[i] = Math.max(-32768, Math.min(32767, sum));
	}

	return mixed;
}

export const onlyInlineAudio = ({
	assets,
	fps,
	timestamp,
	sampleRate,
}: {
	assets: TRenderAsset[];
	fps: number;
	timestamp: number;
	sampleRate: number;
}): AudioData => {
	const inlineAudio = assets.filter((asset) => asset.type === 'inline-audio');

	const expectedLength = Math.round(
		(TARGET_NUMBER_OF_CHANNELS * sampleRate) / fps,
	);

	for (const asset of inlineAudio) {
		if (asset.toneFrequency !== 1) {
			throw new Error(
				'Setting the toneFrequency is not supported yet in web rendering.',
			);
		}
	}

	const mixedAudio = mixAudio(
		inlineAudio.map((asset) => asset.audio as Int16Array),
		expectedLength,
	) as Int16Array<ArrayBuffer>;

	return new AudioData({
		data: mixedAudio,
		format: 's16',
		numberOfChannels: TARGET_NUMBER_OF_CHANNELS,
		numberOfFrames: expectedLength / TARGET_NUMBER_OF_CHANNELS,
		sampleRate,
		timestamp,
	});
};
