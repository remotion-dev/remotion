import {useContext} from 'react';
import {SequenceContext} from './SequenceContext.js';
import {VisualModeGettersContext} from './SequenceManager.js';

export const useSequenceControlOverride = (
	key: string,
): unknown | undefined => {
	const seqContext = useContext(SequenceContext);
	const {dragOverrides: overrides} = useContext(VisualModeGettersContext);
	if (!seqContext) {
		return undefined;
	}

	return overrides[seqContext.id]?.[key];
};
