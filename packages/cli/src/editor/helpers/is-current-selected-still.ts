import {useMemo} from 'react';
import {Internals} from 'remotion';
import {isCompositionStill} from './is-composition-still';

export const useIsStill = () => {
	const resolved = Internals.useResolvedVideoConfig(null);

	if (!resolved || resolved.type !== 'success') {
		return false;
	}

	return isCompositionStill(resolved.result);
};

export const useDimensions = () => {
	const config = Internals.useUnsafeVideoConfig();

	return useMemo(() => {
		if (!config) {
			return null;
		}

		return {
			width: config.width,
			height: config.height,
		};
	}, [config]);
};
