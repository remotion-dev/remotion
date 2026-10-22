import type {RefObject, SetStateAction} from 'react';
import {useMemo, useRef} from 'react';

export type TimelineSeek = {
	readonly revision: RefObject<number>;
	readonly seekFrame: (frame: SetStateAction<Record<string, number>>) => void;
	readonly subscribe: (listener: () => void) => () => void;
};

// One instance per timeline, shared by Studio and Player. Keep the revision
// outside the React updater: updaters may be deferred or run more than once.
export const useTimelineSeek = (
	setFrame: (frame: SetStateAction<Record<string, number>>) => void,
): TimelineSeek => {
	const revision = useRef(0);
	const listeners = useRef(new Set<() => void>());
	return useMemo(
		() => ({
			revision,
			seekFrame: (frame) => {
				// Even a same-frame seek is a boundary for the next media update.
				revision.current++;
				for (const listener of listeners.current) {
					listener();
				}

				setFrame(frame);
			},
			subscribe: (listener) => {
				listeners.current.add(listener);
				return () => {
					listeners.current.delete(listener);
				};
			},
		}),
		[setFrame],
	);
};
