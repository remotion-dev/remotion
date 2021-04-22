// Determine how many other audio tracks are not being finished yet given
// an audio track. This includes audio tracks that will be played in the future.
// Because of split-assets-into-segments, we are guaranteed to have no overlapping
// audio tracks.

import {Assets, MediaAsset} from './types';

export const getSimultaneousAssets = (allAssets: Assets, asset: MediaAsset) => {
	return allAssets.filter((a) => {
		return a.startInVideo >= asset.startInVideo;
	});
};
