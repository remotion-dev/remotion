import {MediaAsset} from './types';

export const assetIsUsedAtTime = (asset: MediaAsset, frame: number) => {
	return (
		frame >= asset.startInVideo && frame < asset.startInVideo + asset.duration
	);
};
