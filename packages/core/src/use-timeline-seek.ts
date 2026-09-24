import type {RefObject, SetStateAction} from 'react';
import {useMemo, useRef} from 'react';

export type TimelineSeek = {
	readonly revision: RefObject<number>;
	readonly setFrame: (frame: SetStateAction<Record<string, number>>) => void;
};

// One instance per timeline, shared by Studio and Player. Keep the revision
// outside the React updater: updaters may be deferred or run more than once.
export const useTimelineSeek = (
	setFrame: (frame: SetStateAction<Record<string, number>>) => void,
): TimelineSeek => {
	const revision = useRef(0);
	return useMemo(
		() => ({
			revision,
			setFrame: (frame) => {
				// Even a same-frame seek is a boundary for the next media update.
				revision.current++;
				setFrame(frame);
			},
		}),
		[setFrame],
	);
};
