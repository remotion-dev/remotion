import {Internals} from 'remotion';
import {calculateATempo} from './assets/calculate-atempo';
import {ffmpegVolumeExpression} from './assets/ffmpeg-volume-expression';
import {AssetVolume} from './assets/types';

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
}) => {
	const startInVideoSeconds = startInVideo / fps;

	const volumeFilter = ffmpegVolumeExpression({
		volume,
		startInVideo,
		fps,
	});

	// Avoid setting filters if possible, as combining them can create noise

	const chunkLength = durationInFrames / fps;

	const actualTrimRight = assetDuration
		? Math.min(trimRight, assetDuration)
		: trimRight;

	const padAtEnd =
		chunkLength - (actualTrimRight - trimLeft) - startInVideoSeconds;

	return (
		`[0:a]` +
		[
			// Order matters! First trim the audio
			`atrim=${trimLeft.toFixed(6)}:${actualTrimRight.toFixed(6)}`,
			// then set the tempo
			calculateATempo(playbackRate),
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
			// set the volume if needed
			volumeFilter.value === '1'
				? null
				: `volume=${volumeFilter.value}:eval=${volumeFilter.eval}`,
			// Only in the end, we pad to the full length.
			padAtEnd > 0.0000001 ? 'apad=pad_dur=' + padAtEnd.toFixed(6) : null,
		]
			.filter(Internals.truthy)
			.join(',') +
		`[a0]`
	);
};
