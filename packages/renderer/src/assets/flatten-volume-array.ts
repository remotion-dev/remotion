// An input is an array with volume levels for each frame, like
// [1, 1, 1, 1, 1, ...].
// If all elements are the same, we flatten it to `1`, otherwise we leave it as an array.

import type {AssetVolume, MediaAsset} from './types';

export const flattenVolumeArray = (volume: AssetVolume): AssetVolume => {
	if (typeof volume === 'number') {
		return volume;
	}

	if (volume.length === 0) {
		throw new TypeError('Volume array must have at least 1 number');
	}

	if (new Set(volume).size === 1) {
		return volume[0];
	}

	return volume;
};

export const convertAssetToFlattenedVolume = (
	asset: MediaAsset,
): MediaAsset => {
	return {
		...asset,
		volume: flattenVolumeArray(asset.volume),
	};
};
