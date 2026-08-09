import type {Context} from 'react';
import React, {useMemo, useRef} from 'react';
import type {TimelineImperativeContextValue} from 'remotion';
import {Internals} from 'remotion';

const PlayerTimelineImperativeContext =
	React.createContext<TimelineImperativeContextValue | null>(null);

const getCoreTimelineImperativeContext = () => {
	return (
		Internals as typeof Internals & {
			TimelineImperativeContext?: Context<TimelineImperativeContextValue | null>;
		}
	).TimelineImperativeContext;
};

export const getTimelineImperativeContext = () => {
	return getCoreTimelineImperativeContext() ?? PlayerTimelineImperativeContext;
};

export const CoreTimelineImperativeContextProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly value: TimelineImperativeContextValue;
}> = ({children, value}) => {
	const TimelineImperativeContext = getCoreTimelineImperativeContext();

	if (!TimelineImperativeContext) {
		return children;
	}

	return (
		<TimelineImperativeContext.Provider value={value}>
			{children}
		</TimelineImperativeContext.Provider>
	);
};

const LegacyTimelineImperativeContextProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const timelineContext = Internals.Timeline.useTimelineContext();
	const frameRef = useRef(timelineContext.frame);
	frameRef.current = timelineContext.frame;

	const value = useMemo((): TimelineImperativeContextValue => {
		return {
			frameRef,
			imperativePlaying: timelineContext.imperativePlaying,
			audioAndVideoTags: timelineContext.audioAndVideoTags,
		};
	}, [timelineContext.audioAndVideoTags, timelineContext.imperativePlaying]);

	return (
		<PlayerTimelineImperativeContext.Provider value={value}>
			{children}
		</PlayerTimelineImperativeContext.Provider>
	);
};

export const TimelineImperativeCompatibilityProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	if (getCoreTimelineImperativeContext()) {
		return children;
	}

	return (
		<LegacyTimelineImperativeContextProvider>
			{children}
		</LegacyTimelineImperativeContextProvider>
	);
};
