import {type _InternalTypes} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {Codec} from './codec';

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
