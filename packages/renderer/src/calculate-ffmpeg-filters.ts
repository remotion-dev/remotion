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
	forSeamlessAacConcatenation,
}: {
	asset: MediaAsset;
	fps: number;
	channels: number;
	assetDuration: number | null;
	trimLeftOffset: number;
	trimRightOffset: number;
	chunkLengthInSeconds: number;
	forSeamlessAacConcatenation: boolean;
}): FilterWithoutPaddingApplied | null => {
	// TODO: Don't need this wrapper function anymore
	return stringifyFfmpegFilter({
		channels,
		startInVideo: asset.startInVideo,
		volume: flattenVolumeArray(asset.volume),
		fps,
		playbackRate: asset.playbackRate,
		assetDuration,
		allowAmplificationDuringRender: asset.allowAmplificationDuringRender,
		toneFrequency: asset.toneFrequency,
		chunkLengthInSeconds,
		forSeamlessAacConcatenation,
		trimLeftOffset,
		trimRightOffset,
		asset,
	});
};
