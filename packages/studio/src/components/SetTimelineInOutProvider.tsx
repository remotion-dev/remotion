import React, {useEffect, useMemo, useState} from 'react';
import type {
	SetTimelineInOutContextValue,
	TimelineInOutContextValue,
} from '../state/in-out';
import {SetTimelineInOutContext, TimelineInOutContext} from '../state/in-out';
import {loadMarks, persistMarks} from '../state/marks';

export const SetTimelineInOutProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [inAndOutFrames, setInAndOutFrames] =
		useState<TimelineInOutContextValue>(() => loadMarks());

	const setTimelineInOutContextValue =
		useMemo((): SetTimelineInOutContextValue => {
			return {
				setInAndOutFrames,
			};
		}, []);

	useEffect(() => {
		persistMarks(inAndOutFrames);
	}, [inAndOutFrames]);

	return (
		<TimelineInOutContext.Provider value={inAndOutFrames}>
			<SetTimelineInOutContext.Provider value={setTimelineInOutContextValue}>
				{children}
			</SetTimelineInOutContext.Provider>
		</TimelineInOutContext.Provider>
	);
};
