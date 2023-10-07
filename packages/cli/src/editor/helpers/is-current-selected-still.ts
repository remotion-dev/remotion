import {useContext} from 'react';
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

export const useIsVideoComposition = () => {
	const isStill = useIsStill();
	const {canvasContent} = useContext(Internals.CompositionManager);

	if (canvasContent === null) {
		return false;
	}

	if (isStill) {
		return false;
	}

	return canvasContent.type === 'composition';
};
