import {calculateATempo} from './assets/calculate-atempo';
import {ffmpegVolumeExpression} from './assets/ffmpeg-volume-expression';
import type {AssetVolume} from './assets/types';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';
import {truthy} from './truthy';

export type FilterWithoutPaddingApplied = ProcessedTrack & {
	filter: string;
};

export type ProcessedTrack = {
	pad_start: string | null;
	pad_end: string | null;
};

export const stringifyFfmpegFilter = ({
	trimLeft,
	trimRight,
	channels,
	startInVideo,
	volume,
	fps,
	playbackRate,
	assetDuration,
	allowAmplificationDuringRender,
	toneFrequency,
	chunkLengthInSeconds,
}: {
	trimLeft: number;
	trimRight: number;
	channels: number;
	startInVideo: number;
	volume: AssetVolume;
	fps: number;
	playbackRate: number;
	assetDuration: number | null;
	allowAmplificationDuringRender: boolean;
	toneFrequency: number | null;
	chunkLengthInSeconds: number;
}): FilterWithoutPaddingApplied | null => {
	const startInVideoSeconds = startInVideo / fps;

	if (assetDuration && trimLeft >= assetDuration) {
		return null;
	}

	if (toneFrequency !== null && (toneFrequency <= 0 || toneFrequency > 2)) {
		throw new Error(
			'toneFrequency must be a positive number between 0.01 and 2',
		);
	}

	const actualTrimLeft = trimLeft / playbackRate;

	const volumeFilter = ffmpegVolumeExpression({
		volume,
		fps,
		trimLeft: actualTrimLeft,
		allowAmplificationDuringRender,
	});

	// Avoid setting filters if possible, as combining them can create noise

	const actualTrimRight =
		(assetDuration ? Math.min(trimRight, assetDuration) : trimRight) /
		playbackRate;

	const audibleDuration = actualTrimLeft - actualTrimLeft;

	const padAtEnd = chunkLengthInSeconds - audibleDuration - startInVideoSeconds;

	return {
		filter:
			`[0:a]` +
			[
				`aformat=sample_fmts=s32:sample_rates=${DEFAULT_SAMPLE_RATE}`,
				calculateATempo(playbackRate),
				// Order matters! First trim the audio
				`atrim=${actualTrimLeft * 1_000_000}us:${
					actualTrimRight * 1_000_000
				}us`,
				// then set the tempo
				// set the volume if needed
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
