import type {Codec} from './codec';

export const proResProfileOptions = [
	'4444-xq',
	'4444',
	'hq',
	'standard',
	'light',
	'proxy',
] as const;

export type ProResProfile = (typeof proResProfileOptions)[number];

export const validateSelectedCodecAndProResCombination = ({
	codec,
	proResProfile,
}: {
	codec: Codec;
	proResProfile: ProResProfile | undefined;
}) => {
	if (typeof proResProfile !== 'undefined' && codec !== 'prores') {
		throw new TypeError(
			`You have set a ProRes profile but the codec is "${codec}". Set the codec to "prores" or remove the ProRes profile.`,
		);
	}

	if (
		proResProfile !== undefined &&
		!proResProfileOptions.includes(proResProfile as ProResProfile)
	) {
		throw new TypeError(
			`The ProRes profile "${proResProfile}" is not valid. Valid options are ${proResProfileOptions
				.map((p) => `"${p}"`)
				.join(', ')}`,
		);
	}
};
