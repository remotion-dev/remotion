import React from 'react';
import type {TSequence} from 'remotion';

export type TimelineSequenceObserver = (sequences: TSequence[]) => void;

export const TimelineSequenceObserverContext =
	React.createContext<TimelineSequenceObserver | null>(null);
