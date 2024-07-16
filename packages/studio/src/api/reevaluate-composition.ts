import {Internals} from 'remotion';

export const reevaluateComposition = () => {
	Internals.resolveCompositionsRef.current?.reloadCurrentlySelectedComposition();
};
