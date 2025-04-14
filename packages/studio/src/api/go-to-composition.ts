import {Internals} from 'remotion';

export const goToComposition = (compositionId: string) => {
	Internals.compositionSelectorRef.current?.selectComposition(compositionId);
};
