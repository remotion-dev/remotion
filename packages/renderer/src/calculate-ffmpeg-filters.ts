import {flattenVolumeArray} from './assets/flatten-volume-array';
import {MediaAsset} from './assets/types';
import {stringifyFfmpegFilter} from './stringify-ffmpeg-filter';

export const calculateFfmpegFilter = ({
	asset,
	fps,
	durationInFrames,
}: {
	asset: MediaAsset;
	fps: number;
	durationInFrames: number;
}): string | null => {
	const assetTrimLeft = asset.trimLeft / fps;
	const assetTrimRight =
		(asset.trimLeft + asset.duration * asset.playbackRate) / fps;

	const filter = stringifyFfmpegFilter({
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
