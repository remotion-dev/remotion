/**
 * Since audio or video can be base64-encoded, those can be really long strings.
 * Since we track the `src` property for every frame, Node.JS can run out of memory easily. Instead of duplicating the src for every frame, we save memory by replacing the full base 64 encoded data with a string `same-as-[asset-id]-[frame]` referencing a previous asset with the same src.
 */

import type {AudioOrVideoAsset} from 'remotion/no-react';

export const compressAsset = (
	previousRenderAssets: AudioOrVideoAsset[],
	newRenderAsset: AudioOrVideoAsset,
): AudioOrVideoAsset => {
	if (newRenderAsset.src.length < 400) {
		return newRenderAsset;
	}

	const assetWithSameSrc = previousRenderAssets.find(
		(a) => a.src === newRenderAsset.src,
	);
	if (!assetWithSameSrc) {
		return newRenderAsset;
	}

	return {
		...newRenderAsset,
		src: `same-as-${assetWithSameSrc.id}-${assetWithSameSrc.frame}`,
	};
};

export const isAssetCompressed = (src: string) => {
	return src.startsWith('same-as');
};
