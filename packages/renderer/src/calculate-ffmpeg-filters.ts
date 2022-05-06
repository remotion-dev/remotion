import {flattenVolumeArray} from './assets/flatten-volume-array';
import {MediaAsset} from './assets/types';
import {stringifyFfmpegFilter} from './stringify-ffmpeg-filter';

export const calculateFfmpegFilter = ({
	asset,
	fps,
	durationInFrames,
	channels,
}: {
	asset: MediaAsset;
	fps: number;
	durationInFrames: number;
	channels: number;
}): string | null => {
	if (channels === 0) {
		return null;
	}

	const assetTrimLeft = asset.trimLeft / fps;
	const assetTrimRight =
		(asset.trimLeft + asset.duration * asset.playbackRate) / fps;

	const filter = stringifyFfmpegFilter({
		channels,
		startInVideo: asset.startInVideo,
		trimLeft: assetTrimLeft,
		trimRight: assetTrimRight,
		volume: flattenVolumeArray(asset.volume),
		fps,
		playbackRate: asset.playbackRate,
		durationInFrames,
	});

	return filter;
};
