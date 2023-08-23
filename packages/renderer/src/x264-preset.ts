import type {Codec} from './codec';

export const x264PresetOptions = [
	'ultrafast',
	'superfast',
	'veryfast',
	'faster',
	'fast',
	'medium',
	'slow',
	'slower',
	'veryslow',
	'placebo',
] as const;

export type X264Preset = (typeof x264PresetOptions)[number];

export const validateSelectedCodecAndPresetCombination = ({
	codec,
	x264Preset,
}: {
	codec: Codec;
	x264Preset: X264Preset | undefined;
}) => {
	if (
		typeof x264Preset !== 'undefined' &&
		codec !== 'h264' &&
		codec !== 'h264-mkv'
	) {
		throw new TypeError(
			`You have set a x264 preset but the codec is "${codec}". Set the codec to "h264" or remove the Preset profile.`,
		);
	}

	if (
		x264Preset !== undefined &&
		!x264PresetOptions.includes(x264Preset as X264Preset)
	) {
		throw new TypeError(
			`The Preset profile "${x264Preset}" is not valid. Valid options are ${x264PresetOptions
				.map((p) => `"${p}"`)
				.join(', ')}`,
		);
	}
};
