import {Internals} from 'remotion';

/**
 * Selects a composition in the Remotion Studio.
 * @param compositionId - The ID of the composition to select.
 * @see [Documentation](/docs/studio/go-to-composition)
 */
export const goToComposition = (compositionId: string) => {
	Internals.compositionSelectorRef.current?.selectComposition(compositionId);
};
