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

	const realLeftEnd = chunkStart - compositionStart;
	const realRightEnd = realLeftEnd + durationInFrames / fps;

	const aacAdjustedLeftEnd = Math.max(
		0,
		getClosestAlignedTime(realLeftEnd) - 2 * (1024 / DEFAULT_SAMPLE_RATE),
	);
	const aacAdjustedRightEnd =
		getClosestAlignedTime(realRightEnd) + 2 * (1024 / DEFAULT_SAMPLE_RATE);

	const aacAdjustedLeft = forSeamlessAacConcatenation
		? aacAdjustedLeftEnd - realLeftEnd
		: 0;
	const aacAdjustedRight = forSeamlessAacConcatenation
		? aacAdjustedRightEnd - realRightEnd
		: 0;

	const normalTrimLeft = (asset.trimLeft * asset.playbackRate) / fps;
	const normalTrimRight =
		((asset.trimLeft + asset.duration) * asset.playbackRate) / fps;

	const assetTrimLeft = forSeamlessAacConcatenation
		? normalTrimLeft + aacAdjustedLeft
		: normalTrimLeft;
	const assetTrimRight = forSeamlessAacConcatenation
		? normalTrimRight + aacAdjustedRight
		: normalTrimRight;

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
