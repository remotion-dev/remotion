import {TAsset} from './CompositionManager';

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
