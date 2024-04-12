import {calculateATempo} from './assets/calculate-atempo';
import {ffmpegVolumeExpression} from './assets/ffmpeg-volume-expression';
import type {AssetVolume, MediaAsset} from './assets/types';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';
import {truthy} from './truthy';

export type FilterWithoutPaddingApplied = ProcessedTrack & {
	filter: string;
};

export type ProcessedTrack = {
	pad_start: string | null;
	pad_end: string | null;
};

const stringifyTrim = (trim: number) => {
	const value = trim * 1_000_000;
	const asString = `${value}us`;

	// Handle very small values such as `"6e-7us"`, those are essentially rounding errors to 0
	if (asString.includes('e-')) {
		return '0us';
	}

	return asString;
};

export const getActualTrimLeft = ({
	asset,
	fps,
	trimLeftOffset,
	seamless,
}: {
	asset: MediaAsset;
	fps: number;
	trimLeftOffset: number;
	seamless: boolean;
}) => {
	const sinceStart = asset.trimLeft - asset.audioStartFrame;
	if (!seamless) {
		return (
			asset.audioStartFrame / fps +
			(sinceStart / fps) * asset.playbackRate +
			trimLeftOffset
		);
	}

	if (seamless) {
		return (
			asset.audioStartFrame / fps / asset.playbackRate +
			sinceStart / fps +
			trimLeftOffset
		);
	}

	throw new Error('This should never happen');
};

const trimAndSetTempo = ({
	forSeamlessAacConcatenation,
	assetDuration,
	asset,
	trimLeftOffset,
	trimRightOffset,
	fps,
}: {
	forSeamlessAacConcatenation: boolean;
	assetDuration: number | null;
	trimLeftOffset: number;
	trimRightOffset: number;
	asset: MediaAsset;
	fps: number;
}): {
	actualTrimLeft: number;
	filter: (string | null)[];
	audibleDuration: number;
} => {
	// If we need seamless AAC stitching, we need to apply the tempo filter first
	// because the atempo filter is not frame-perfect. It creates a small offset
	// and the offset needs to be the same for all audio tracks, before processing it further.
	// This also affects the trimLeft and trimRight values, as they need to be adjusted.
	if (forSeamlessAacConcatenation) {
		const trimLeft = getActualTrimLeft({
			asset,
			fps,
			trimLeftOffset,
			seamless: true,
		});
		const trimRight =
			trimLeft + asset.duration / fps - trimLeftOffset + trimRightOffset;

		const trimRightOrAssetDuration = assetDuration
			? Math.min(trimRight, assetDuration / asset.playbackRate)
			: trimRight;

		if (trimRightOrAssetDuration < trimLeft) {
			throw new Error(
				'trimRightOrAssetDuration < trimLeft: ' +
					JSON.stringify({
						trimRight,
						trimLeft,
						assetDuration,
						assetTrimLeft: asset.trimLeft,
					}),
			);
		}

		return {
			filter: [
				calculateATempo(asset.playbackRate),
				`atrim=${stringifyTrim(trimLeft)}:${stringifyTrim(trimRight)}`,
			],
			actualTrimLeft: trimLeft,
			audibleDuration: trimRight - trimLeft,
		};
	}

	// Otherwise, we first trim and then apply playback rate, as then the atempo
	// filter needs to do less work.
	if (!forSeamlessAacConcatenation) {
		const actualTrimLeft = getActualTrimLeft({
			asset,
			fps,
			trimLeftOffset,
			seamless: false,
		});
		const trimRight =
			actualTrimLeft + (asset.duration / fps) * asset.playbackRate;

		const trimRightOrAssetDuration = assetDuration
			? Math.min(trimRight, assetDuration)
			: trimRight;

		return {
			filter: [
				`atrim=${stringifyTrim(actualTrimLeft)}:${stringifyTrim(
					trimRightOrAssetDuration,
				)}`,
				calculateATempo(asset.playbackRate),
			],
			actualTrimLeft,
			audibleDuration:
				(trimRightOrAssetDuration - actualTrimLeft) / asset.playbackRate,
		};
	}

	throw new Error('This should never happen');
};

export const stringifyFfmpegFilter = ({
	channels,
	volume,
	fps,
	assetDuration,
	chunkLengthInSeconds,
	forSeamlessAacConcatenation,
	trimLeftOffset,
	trimRightOffset,
	asset,
}: {
	channels: number;
	volume: AssetVolume;
	fps: number;
	assetDuration: number | null;
	chunkLengthInSeconds: number;
	forSeamlessAacConcatenation: boolean;
	trimLeftOffset: number;
	trimRightOffset: number;
	asset: MediaAsset;
}): FilterWithoutPaddingApplied | null => {
	if (channels === 0) {
		return null;
	}

	const {toneFrequency, startInVideo, playbackRate} = asset;

	const startInVideoSeconds = startInVideo / fps;

	if (
		assetDuration &&
		getActualTrimLeft({
			asset,
			fps,
			trimLeftOffset,
			seamless: forSeamlessAacConcatenation,
		}) >=
			assetDuration / playbackRate
	) {
		return null;
	}

	if (toneFrequency !== null && (toneFrequency <= 0 || toneFrequency > 2)) {
		throw new Error(
			'toneFrequency must be a positive number between 0.01 and 2',
		);
	}

	const {
		actualTrimLeft,
		audibleDuration,
		filter: trimAndTempoFilter,
	} = trimAndSetTempo({
		forSeamlessAacConcatenation,
		assetDuration,
		trimLeftOffset,
		trimRightOffset,
		asset,
		fps,
	});

	const volumeFilter = ffmpegVolumeExpression({
		volume,
		fps,
		trimLeft: actualTrimLeft,
		allowAmplificationDuringRender: asset.allowAmplificationDuringRender,
	});

	const padAtEnd = chunkLengthInSeconds - audibleDuration - startInVideoSeconds;

	// Set as few filters as possible, as combining them can create noise
	return {
		filter:
			`[0:a]` +
			[
				`aformat=sample_fmts=s32:sample_rates=${DEFAULT_SAMPLE_RATE}`,
				// The order matters here! For speed and correctness, we first trim the audio
				...trimAndTempoFilter,
				// The timings for volume must include whatever is in atrim, unless the volume
				// filter gets applied before atrim
				volumeFilter.value === '1'
					? null
					: `volume=${volumeFilter.value}:eval=${volumeFilter.eval}`,
				toneFrequency && toneFrequency !== 1
					? `asetrate=${DEFAULT_SAMPLE_RATE}*${toneFrequency},aresample=${DEFAULT_SAMPLE_RATE},atempo=1/${toneFrequency}`
					: null,
			]
				.filter(truthy)
				.join(',') +
			`[a0]`,
		pad_end:
			padAtEnd > 0.0000001
				? 'apad=pad_len=' + Math.round(padAtEnd * DEFAULT_SAMPLE_RATE)
				: null,
		pad_start:
			// For n channels, we delay n + 1 channels.
			// This is because `ffprobe` for some audio files reports the wrong amount
			// of channels.
			// This should be fine because FFMPEG documentation states:
			// "Unused delays will be silently ignored."
			// https://ffmpeg.org/ffmpeg-filters.html#adelay
			startInVideoSeconds === 0
				? null
				: `adelay=${new Array(channels + 1)
						.fill((startInVideoSeconds * 1000).toFixed(0))
						.join('|')}`,
	};
};
