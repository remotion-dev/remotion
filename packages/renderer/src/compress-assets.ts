/**
 * Since audio or video can be base64-encoded, those can be really long strings.
 * Since we track the `src` property for every frame, Node.JS can run out of memory easily. Instead of duplicating the src for every frame, we save memory by replacing the full base 64 encoded data with a string `same-as-[asset-id]-[frame]` referencing a previous asset with the same src.
 */

import type {TAsset} from 'remotion';

export const compressAsset = (
	previousAssets: TAsset[],
	newAsset: TAsset
): TAsset => {
	if (newAsset.src.length < 400) {
		return newAsset;
	}

	const assetWithSameSrc = previousAssets.find((a) => a.src === newAsset.src);
	if (!assetWithSameSrc) {
		return newAsset;
	}

	return {
		...newAsset,
		src: `same-as-${assetWithSameSrc.id}-${assetWithSameSrc.frame}`,
	};
};

export const isAssetCompressed = (src: string) => {
	return src.startsWith('same-as');
};
