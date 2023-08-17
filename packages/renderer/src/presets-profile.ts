import type {Codec} from './codec';

export const presetsProfileOptions = [
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

export type PresetsProfile = typeof presetsProfileOptions[number];

export const validateSelectedCodecAndPresetCombination = ({
	codec,
	presetsProfile: presetsProfile,
}: {
	codec: Codec;
	presetsProfile: PresetsProfile | undefined;
}) => {
	if (typeof presetsProfile !== 'undefined' && codec !== 'h264') {
		throw new TypeError(
			`You have set a Preset profile but the codec is "${codec}". Set the codec to "h264" or remove the Preset profile.`
		);
	}

	if (
		presetsProfile !== undefined &&
		!presetsProfileOptions.includes(presetsProfile as PresetsProfile)
	) {
		throw new TypeError(
			`The Preset profile "${presetsProfile}" is not valid. Valid options are ${presetsProfileOptions
				.map((p) => `"${p}"`)
				.join(', ')}`
		);
	}
};
