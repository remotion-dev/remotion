import type {TRenderAsset} from 'remotion/no-react';

// An unsafe asset is an asset with looser types, which occurs
// during construction of the asset list. Prefer the MediaAsset
// type instead.
export type UnsafeAsset = Omit<
	TRenderAsset,
	'frame' | 'id' | 'volume' | 'mediaFrame'
> & {
	startInVideo: number;
	duration: number | null;
	trimLeft: number;
	volume: number[];
	id: string;
	playbackRate: number;
	allowAmplificationDuringRender: boolean;
	toneFrequency: number | null;
};

// Volume can either be static, for all frames the same,
// or an array with volume for each frame.
export type AssetVolume = number | number[];

export type MediaAsset = Omit<UnsafeAsset, 'duration' | 'volume'> & {
	duration: number;
	volume: AssetVolume;
};

export const uncompressMediaAsset = (
	allRenderAssets: TRenderAsset[],
	assetToUncompress: TRenderAsset,
): TRenderAsset => {
	const isCompressed = assetToUncompress.src.match(/same-as-(.*)-([0-9]+)$/);
	if (!isCompressed) {
		return assetToUncompress;
	}

	const [, id, frame] = isCompressed;

	const assetToFill = allRenderAssets.find(
		(a) => a.id === id && String(a.frame) === frame,
	);
	if (!assetToFill) {
		console.log('List of assets:');
		console.log(allRenderAssets);
		throw new TypeError(
			`Cannot uncompress asset, asset list seems corrupt. Please file a bug in the Remotion repo with the debug information above.`,
		);
	}

	return {
		...assetToUncompress,
		src: assetToFill.src,
	};
};

export type Assets = MediaAsset[];
