import {type _InternalTypes} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {Codec} from './codec';
import {validateProResBitsPerMacroblock} from './options/prores-bits-per-macroblock';

export const validateSelectedCodecAndProResCombination = ({
	codec,
	proResProfile,
	proResBitsPerMacroblock,
}: {
	codec: Codec;
	proResProfile: _InternalTypes['ProResProfile'] | undefined;
	proResBitsPerMacroblock: number | null;
}) => {
	validateProResBitsPerMacroblock(proResBitsPerMacroblock);
	if (proResBitsPerMacroblock !== null && codec !== 'prores') {
		throw new TypeError('proResBitsPerMacroblock requires the prores codec.');
	}

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
