import {flattenVolumeArray} from './assets/flatten-volume-array';
import type {MediaAsset} from './assets/types';
import type {FilterWithoutPaddingApplied} from './stringify-ffmpeg-filter';
import {stringifyFfmpegFilter} from './stringify-ffmpeg-filter';

export const calculateFfmpegFilter = ({
	asset,
	fps,
	channels,
	assetDuration,
	trimLeftOffset,
	trimRightOffset,
	chunkLengthInSeconds,
}: {
	asset: MediaAsset;
	fps: number;
	channels: number;
	assetDuration: number | null;
	trimLeftOffset: number;
	trimRightOffset: number;
	chunkLengthInSeconds: number;
}): FilterWithoutPaddingApplied | null => {
	if (channels === 0) {
		return null;
	}

	const trimLeft =
		(asset.trimLeft * asset.playbackRate) / fps +
		trimLeftOffset * asset.playbackRate;
	const trimRight =
		trimLeft +
		(asset.duration * asset.playbackRate) / fps +
		trimRightOffset * asset.playbackRate;

	return stringifyFfmpegFilter({
		channels,
		startInVideo: asset.startInVideo,
		trimLeft,
		trimRight,
		volume: flattenVolumeArray(asset.volume),
		fps,
		playbackRate: asset.playbackRate,
		assetDuration,
		allowAmplificationDuringRender: asset.allowAmplificationDuringRender,
		toneFrequency: asset.toneFrequency,
		chunkLengthInSeconds,
	});
};
