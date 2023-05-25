import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {isCompositionStill} from './is-composition-still';

export const useIsStill = () => {
	const resolved = Internals.useResolvedVideoConfig(null);

	if (!resolved) {
		return false;
	}

	return isCompositionStill(resolved);
};

export const useDimensions = () => {
	const {compositions, currentComposition} = useContext(
		Internals.CompositionManager
	);

	const selected = useMemo(
		() => compositions.find((c) => c.id === currentComposition),
		[compositions, currentComposition]
	);

	return useMemo(() => {
		if (!selected) {
			return null;
		}

		return {
			width: selected.width,
			height: selected.height,
		};
	}, [selected]);
};
