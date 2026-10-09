import {createContext, useContext} from 'react';
import type {TimelineContextValue} from './TimelineContext.js';

export {DEFAULT_SEQUENCE_ACTIVITY_LIMIT} from './sequence-activity-defaults.js';

// Internal Studio experiment. Hidden Activity trees register on commit, so the
// experiment is disabled when the sequence manager falls back to effects.
export const SequenceActivityContext = createContext(false);
export const SequenceActivityDormantContext = createContext(false);
export const SequenceActivitySettingsContext = createContext<{
	readonly enabled: boolean;
	readonly limit: number;
} | null>(null);

// React propagates changed ancestor contexts through hidden Activity trees,
// even when a nested provider keeps their value stable. Use separate context
// identities so dormant clocks do not subscribe to the advancing timeline.
export const SequenceActivityTimelineContext =
	createContext<TimelineContextValue | null>(null);
export const SequenceActivityAbsoluteTimeContext =
	createContext<TimelineContextValue | null>(null);

export const SequenceContent: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return useContext(SequenceActivityDormantContext) ? null : children;
};
