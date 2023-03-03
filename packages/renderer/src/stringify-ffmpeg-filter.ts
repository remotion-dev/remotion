import {calculateATempo} from './assets/calculate-atempo';
import {ffmpegVolumeExpression} from './assets/ffmpeg-volume-expression';
import type {AssetVolume} from './assets/types';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';
import {truthy} from './truthy';

export type Track = ProcessedTrack & {
	filter: string;
};

export type ProcessedTrack = {
	pad_start: string | null;
	pad_end: number | null;
	channels: number;
};

export const stringifyFfmpegFilter = ({
	trimLeft,
	trimRight,
	channels,
	startInVideo,
	volume,
	fps,
	playbackRate,
	durationInFrames,
	assetDuration,
	allowAmplificationDuringRender,
}: {
	trimLeft: number;
	trimRight: number;
	channels: number;
	startInVideo: number;
	volume: AssetVolume;
	fps: number;
	durationInFrames: number;
	playbackRate: number;
	assetDuration: number | null;
	allowAmplificationDuringRender: boolean;
}): Track | null => {
	const startInVideoSeconds = startInVideo / fps;

	if (assetDuration && trimLeft >= assetDuration) {
		return null;
	}

	const volumeFilter = ffmpegVolumeExpression({
		volume,
		fps,
		trimLeft,
		allowAmplificationDuringRender,
	});

	// Avoid setting filters if possible, as combining them can create noise

	const chunkLength = durationInFrames / fps;

	const actualTrimRight = assetDuration
		? Math.min(trimRight, assetDuration)
		: trimRight;

	const audibleDuration = (actualTrimRight - trimLeft) / playbackRate;

	const padAtEnd = chunkLength - audibleDuration - startInVideoSeconds;

	return {
		filter:
			`[0:a]` +
			[
				`aformat=sample_fmts=s32:sample_rates=${DEFAULT_SAMPLE_RATE}`,
				// Order matters! First trim the audio
				`atrim=${trimLeft.toFixed(6)}:${actualTrimRight.toFixed(6)}`,
				// then set the tempo
				calculateATempo(playbackRate),
				// set the volume if needed
				// The timings for volume must include whatever is in atrim, unless the volume
				// filter gets applied before atrim
				volumeFilter.value === '1'
					? null
					: `volume=${volumeFilter.value}:eval=${volumeFilter.eval}`,
				// For n channels, we delay n + 1 channels.
				// This is because `ffprobe` for some audio files reports the wrong amount
				// of channels.
				// This should be fine because FFMPEG documentation states:
				// "Unused delays will be silently ignored."
				// https://ffmpeg.org/ffmpeg-filters.html#adelay
			]
				.filter(truthy)
				.join(',') +
			`[a0]`,

		channels,
		pad_end:
			padAtEnd > 0.0000001 ? Math.round(padAtEnd * DEFAULT_SAMPLE_RATE) : null,
		pad_start:
			startInVideoSeconds === 0
				? null
				: `adelay=${new Array(channels + 1)
						.fill((startInVideoSeconds * 1000).toFixed(0))
						.join('|')}`,
	};
};
