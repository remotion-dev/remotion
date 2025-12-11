import type {TRenderAsset} from 'remotion';

const TARGET_NUMBER_OF_CHANNELS = 2;
const TARGET_SAMPLE_RATE = 48000;

function mixAudio(waves: Int16Array[], length: number) {
	if (waves.length === 1) {
		return waves[0];
	}

	const mixed = new Int16Array(length);

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
	frame,
}: {
	assets: TRenderAsset[];
	fps: number;
	frame: number;
}): AudioData | null => {
	const inlineAudio = assets.filter((asset) => asset.type === 'inline-audio');
	if (inlineAudio.length === 0) {
		return null;
	}

	const expectedLength = Math.round(
		(TARGET_NUMBER_OF_CHANNELS * TARGET_SAMPLE_RATE) / fps,
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
		sampleRate: TARGET_SAMPLE_RATE,
		timestamp: (frame / fps) * 1_000_000,
	});
};
