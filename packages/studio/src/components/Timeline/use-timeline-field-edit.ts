import {useCallback, useRef} from 'react';

// A pending save may finish after the next scrub or text edit has started.
// Only that edit's own completion may clear its local input state.
export const useTimelineFieldEdit = () => {
	const revision = useRef(0);
	const markEdit = useCallback(() => {
		revision.current++;
	}, []);
	const finishEdit = useCallback((save: Promise<void>, clear: () => void) => {
		const savedRevision = revision.current;
		return save.finally(() => {
			if (revision.current === savedRevision) clear();
		});
	}, []);
	return {markEdit, finishEdit};
};
