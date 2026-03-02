import {useContext} from 'react';
import {SequenceContext} from './SequenceContext.js';
import {VisualModeOverridesContext} from './SequenceManager.js';

export const useSequenceControlOverride = (
	key: string,
): unknown | undefined => {
	const seqContext = useContext(SequenceContext);
	const {dragOverrides: overrides} = useContext(VisualModeOverridesContext);
	if (!seqContext) {
		return undefined;
	}

	return overrides[seqContext.id]?.[key];
};
