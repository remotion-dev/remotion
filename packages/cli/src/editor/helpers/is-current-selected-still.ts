import {Internals} from 'remotion';
import {isCompositionStill} from './is-composition-still';

export type Dimensions = {
	width: number;
	height: number;
};

export const useIsStill = () => {
	const resolved = Internals.useResolvedVideoConfig(null);

	if (!resolved || resolved.type !== 'success') {
		return false;
	}

	return isCompositionStill(resolved.result);
};
