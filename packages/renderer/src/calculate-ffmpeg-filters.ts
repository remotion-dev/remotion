import {flattenVolumeArray} from './assets/flatten-volume-array';
import type {MediaAsset} from './assets/types';
import {getClosestAlignedTime} from './combine-audio';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';
import type {FilterWithoutPaddingApplied} from './stringify-ffmpeg-filter';
import {stringifyFfmpegFilter} from './stringify-ffmpeg-filter';

export const calculateFfmpegFilter = ({
	asset,
	fps,
	durationInFrames,
	channels,
	assetDuration,
	forSeamlessAacConcatenation,
	compositionStart,
	chunkStart,
}: {
	asset: MediaAsset;
	fps: number;
	durationInFrames: number;
	channels: number;
	assetDuration: number | null;
	forSeamlessAacConcatenation: boolean;
	compositionStart: number;
	chunkStart: number;
}): FilterWithoutPaddingApplied | null => {
	if (channels === 0) {
		return null;
	}

	const assetTrimLeft = forSeamlessAacConcatenation
		? Math.max(
				0,
				getClosestAlignedTime(
					(asset.trimLeft * asset.playbackRate) / fps,
					compositionStart,
					true,
				) /
					1_000_000 -
					2 * (1024 / DEFAULT_SAMPLE_RATE),
			)
		: (asset.trimLeft * asset.playbackRate) / fps;
	const assetTrimRight = forSeamlessAacConcatenation
		? getClosestAlignedTime(
				((asset.trimLeft + asset.duration) * asset.playbackRate) / fps,
				compositionStart,
				true,
			) /
				1_000_000 +
			2 * (1024 / DEFAULT_SAMPLE_RATE)
		: assetTrimLeft + (asset.duration * asset.playbackRate) / fps;

	console.log({
		assetTrimLeft,
		assetTrimRight,
		asset,
		targetRight:
			((asset.trimLeft + asset.duration * asset.playbackRate) / fps) *
			1_000_000,
	});

	return stringifyFfmpegFilter({
		channels,
		startInVideo: asset.startInVideo,
		trimLeft: assetTrimLeft,
		trimRight: assetTrimRight,
		volume: flattenVolumeArray(asset.volume),
		fps,
		playbackRate: asset.playbackRate,
		durationInFrames,
		assetDuration,
		allowAmplificationDuringRender: asset.allowAmplificationDuringRender,
		toneFrequency: asset.toneFrequency,
	});
};
