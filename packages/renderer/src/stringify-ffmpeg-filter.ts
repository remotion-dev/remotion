import {calculateATempo} from './assets/calculate-atempo';
import {ffmpegVolumeExpression} from './assets/ffmpeg-volume-expression';
import type {AssetVolume} from './assets/types';
import {getClosestAlignedTime} from './combine-audio';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';
import {truthy} from './truthy';

export type FilterWithoutPaddingApplied = ProcessedTrack & {
	filter: string;
};

export type ProcessedTrack = {
	pad_start: string | null;
	pad_end: string | null;
};

const oneAudioPacketLength = 1024 / DEFAULT_SAMPLE_RATE;

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
	toneFrequency,
	addTwoPacketPadding,
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
	toneFrequency: number | null;
	addTwoPacketPadding: boolean;
}): FilterWithoutPaddingApplied | null => {
	const startInVideoUs = (startInVideo / fps) * 1_000_000;

	if (assetDuration && trimLeft >= assetDuration) {
		return null;
	}

	if (toneFrequency !== null && (toneFrequency <= 0 || toneFrequency > 2)) {
		throw new Error(
			'toneFrequency must be a positive number between 0.01 and 2',
		);
	}

	const volumeFilter = ffmpegVolumeExpression({
		volume,
		fps,
		trimLeft,
		allowAmplificationDuringRender,
	});

	// Avoid setting filters if possible, as combining them can create noise

	const chunkLengthUs = (durationInFrames / fps) * 1_000_000;

	const actualTrimRight = assetDuration
		? Math.min(trimRight, assetDuration)
		: trimRight;

	const trimLeftInUs = Math.round(trimLeft * 1_000_000);
	const trimRightInUs = Math.round(actualTrimRight * 1_000_000);

	const actualTrimLeftInUs = addTwoPacketPadding
		? getClosestAlignedTime(trimLeftInUs) - 2 * oneAudioPacketLength
		: trimLeftInUs;
	const actualTrimRightInUs = addTwoPacketPadding
		? getClosestAlignedTime(trimRightInUs) + 2 * oneAudioPacketLength
		: trimRightInUs;

	const audibleDuration =
		(actualTrimRightInUs - actualTrimLeftInUs) / playbackRate;
	const padAtEnd = getClosestAlignedTime(
		chunkLengthUs - audibleDuration - startInVideoUs,
	);

	return {
		filter:
			`[0:a]` +
			[
				`aformat=sample_fmts=s32:sample_rates=${DEFAULT_SAMPLE_RATE}`,
				// Order matters! First trim the audio
				`atrim=${actualTrimLeftInUs}us:${actualTrimRightInUs}us`,
				// then set the tempo
				calculateATempo(playbackRate),
				// set the volume if needed
				// The timings for volume must include whatever is in atrim, unless the volume
				// filter gets applied before atrim
				volumeFilter.value === '1'
					? null
					: `volume=${volumeFilter.value}:eval=${volumeFilter.eval}`,
				toneFrequency && toneFrequency !== 1
					? `asetrate=${DEFAULT_SAMPLE_RATE}*${toneFrequency},aresample=${DEFAULT_SAMPLE_RATE},atempo=1/${toneFrequency}`
					: null,
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
		pad_end:
			padAtEnd > 0.0000001
				? 'apad=pad_len=' +
					Math.round((padAtEnd * DEFAULT_SAMPLE_RATE) / 1_000_000)
				: null,
		pad_start:
			startInVideoUs === 0
				? null
				: `adelay=${new Array(channels + 1)
						.fill(((startInVideoUs * 1000) / 1_000_000).toFixed(0))
						.join('|')}`,
	};
};
