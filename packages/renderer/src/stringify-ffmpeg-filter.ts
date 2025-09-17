import {calculateATempo} from './assets/calculate-atempo';
import {ffmpegVolumeExpression} from './assets/ffmpeg-volume-expression';
import type {AssetVolume, MediaAsset} from './assets/types';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';
import {truthy} from './truthy';

export type FilterWithoutPaddingApplied = ProcessedTrack & {
	filter: string;
	actualTrimLeft: number;
};

export type ProcessedTrack = {
	pad_start: string | null;
	pad_end: string | null;
};

const cleanUpFloatingPointError = (value: number) => {
	if (value % 1 < 0.0000001) {
		return Math.floor(value);
	}

	if (value % 1 > 0.9999999) {
		return Math.ceil(value);
	}

	return value;
};

const stringifyTrim = (trim: number) => {
	const value = cleanUpFloatingPointError(trim * 1_000_000);

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
	assetDuration,
}: {
	asset: MediaAsset;
	fps: number;
	trimLeftOffset: number;
	seamless: boolean;
	assetDuration: number | null;
}): {
	trimLeft: number;
	maxTrim: number | null;
} => {
	const sinceStart = asset.trimLeft - asset.audioStartFrame;

	if (!seamless) {
		return {
			trimLeft:
				asset.audioStartFrame / fps +
				(sinceStart / fps) * asset.playbackRate +
				trimLeftOffset,
			maxTrim: assetDuration,
		};
	}

	if (seamless) {
		return {
			trimLeft:
				asset.audioStartFrame / fps / asset.playbackRate +
				sinceStart / fps +
				trimLeftOffset,
			maxTrim: assetDuration ? assetDuration / asset.playbackRate : null,
		};
	}

	throw new Error('This should never happen');
};

const trimAndSetTempo = ({
	assetDuration,
	asset,
	trimLeftOffset,
	trimRightOffset,
	fps,
	indent,
	logLevel,
}: {
	assetDuration: number | null;
	trimLeftOffset: number;
	trimRightOffset: number;
	asset: MediaAsset;
	fps: number;
	indent: boolean;
	logLevel: LogLevel;
}): {
	actualTrimLeft: number;
	filter: (string | null)[];
	audibleDuration: number;
} => {
	// We need to apply the tempo filter first
	// because the atempo filter is not frame-perfect.
	// It creates a small offset and the offset needs to be the same for all audio tracks, before processing it further.
	// This also affects the trimLeft and trimRight values, as they need to be adjusted.
	const {trimLeft, maxTrim} = getActualTrimLeft({
		asset,
		fps,
		trimLeftOffset,
		seamless: true,
		assetDuration,
	});
	const trimRight =
		trimLeft + asset.duration / fps - trimLeftOffset + trimRightOffset;

	let trimRightOrAssetDuration = maxTrim
		? Math.min(trimRight, maxTrim)
		: trimRight;

	if (trimRightOrAssetDuration < trimLeft) {
		Log.warn(
			{indent, logLevel},
			'trimRightOrAssetDuration < trimLeft: ' +
				JSON.stringify({
					trimRight,
					trimLeft,
					assetDuration,
					assetTrimLeft: asset.trimLeft,
				}),
		);
		trimRightOrAssetDuration = trimLeft;
	}

	return {
		filter: [
			calculateATempo(asset.playbackRate),
			`atrim=${stringifyTrim(trimLeft)}:${stringifyTrim(trimRightOrAssetDuration)}`,
		],
		actualTrimLeft: trimLeft,
		audibleDuration: trimRightOrAssetDuration - trimLeft,
	};
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
	indent,
	logLevel,
	presentationTimeOffsetInSeconds,
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
	indent: boolean;
	logLevel: LogLevel;
	presentationTimeOffsetInSeconds: number;
}): FilterWithoutPaddingApplied | null => {
	if (channels === 0) {
		return null;
	}

	const {toneFrequency, startInVideo} = asset;

	const startInVideoSeconds = startInVideo / fps;

	const {trimLeft, maxTrim} = getActualTrimLeft({
		asset,
		fps,
		trimLeftOffset,
		seamless: forSeamlessAacConcatenation,
		assetDuration,
	});

	if (maxTrim && trimLeft >= maxTrim) {
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
		assetDuration,
		trimLeftOffset,
		trimRightOffset,
		asset,
		fps,
		indent,
		logLevel,
	});

	const volumeFilter = ffmpegVolumeExpression({
		volume,
		fps,
		trimLeft: actualTrimLeft,
	});

	const padAtEnd = chunkLengthInSeconds - audibleDuration - startInVideoSeconds;

	const padStart =
		startInVideoSeconds +
		(asset.trimLeft === 0 ? presentationTimeOffsetInSeconds : 0);

	// Set as few filters as possible, as combining them can create noise
	return {
		filter:
			'[0:a]' +
			[
				`aformat=sample_fmts=s16:sample_rates=${DEFAULT_SAMPLE_RATE}`,
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
			padStart === 0
				? null
				: `adelay=${new Array(channels + 1)
						.fill((padStart * 1000).toFixed(0))
						.join('|')}`,
		actualTrimLeft,
	};
};
