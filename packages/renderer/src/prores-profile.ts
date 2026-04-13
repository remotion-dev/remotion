import {type _InternalTypes} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {Codec} from './codec';

export const validateSelectedCodecAndBitsPerMbCombination = ({
	codec,
	bitsPerMb,
}: {
	codec: Codec;
	bitsPerMb: number | undefined;
}) => {
	if (bitsPerMb === undefined) {
		return;
	}

	if (codec !== 'prores') {
		throw new TypeError(
			`"bitsPerMb" is only supported when using the "prores" codec. You have set the codec to "${codec}".`,
		);
	}

	if (typeof bitsPerMb !== 'number' || Number.isNaN(bitsPerMb)) {
		throw new TypeError(
			`"bitsPerMb" must be a number, but got ${JSON.stringify(bitsPerMb)}.`,
		);
	}

	if (!Number.isInteger(bitsPerMb)) {
		throw new TypeError(
			`"bitsPerMb" must be an integer, but got ${bitsPerMb}.`,
		);
	}

	if (bitsPerMb < 128) {
		throw new TypeError(
			`"bitsPerMb" must be at least 128, but got ${bitsPerMb}. The prores_ks encoder requires at least 128 bits per macroblock.`,
		);
	}

	if (bitsPerMb > 8192) {
		throw new TypeError(
			`"bitsPerMb" must be at most 8192, but got ${bitsPerMb}.`,
		);
	}
};

export const validateSelectedCodecAndProResCombination = ({
	codec,
	proResProfile,
}: {
	codec: Codec;
	proResProfile: _InternalTypes['ProResProfile'] | undefined;
}) => {
	if (typeof proResProfile !== 'undefined' && codec !== 'prores') {
		throw new TypeError(
			`You have set a ProRes profile but the codec is "${codec}". Set the codec to "prores" or remove the ProRes profile.`,
		);
	}

	if (
		proResProfile !== undefined &&
		!NoReactInternals.proResProfileOptions.includes(
			proResProfile as _InternalTypes['ProResProfile'],
		)
	) {
		throw new TypeError(
			`The ProRes profile "${proResProfile}" is not valid. Valid options are ${NoReactInternals.proResProfileOptions
				.map((p) => `"${p}"`)
				.join(', ')}`,
		);
	}
};
