import type {Codec} from './codec';

const proResProfileOptions = [
	'4444-xq',
	'4444',
	'hq',
	'standard',
	'light',
	'proxy',
] as const;

export type ProResProfile = typeof proResProfileOptions[number];

export const validateSelectedCodecAndProResCombination = (
	actualCodec: Codec,
	actualProResProfile: ProResProfile | undefined
) => {
	if (typeof actualProResProfile !== 'undefined' && actualCodec !== 'prores') {
		throw new TypeError(
			'You have set a ProRes profile but the codec is not "prores". Set the codec to "prores" or remove the ProRes profile.'
		);
	}

	if (
		actualProResProfile !== undefined &&
		!proResProfileOptions.includes(actualProResProfile as ProResProfile)
	) {
		throw new TypeError(
			`The ProRes profile "${actualProResProfile}" is not valid. Valid options are ${proResProfileOptions
				.map((p) => `"${p}"`)
				.join(', ')}`
		);
	}
};
