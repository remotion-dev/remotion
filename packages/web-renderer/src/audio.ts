import type {TRenderAsset} from 'remotion';

export const onlyInlineAudio = (assets: TRenderAsset[]) => {
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
		throw new Error('All inline audio must have a duration and length');
	}
};
