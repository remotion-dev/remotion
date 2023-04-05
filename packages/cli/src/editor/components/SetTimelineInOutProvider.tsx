import React, {useMemo, useState} from 'react';
import type {
	SetTimelineInOutContextValue,
	TimelineInOutContextValue,
} from '../state/in-out';
import {SetTimelineInOutContext, TimelineInOutContext} from '../state/in-out';

export const SetTimelineInOutProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [inAndOutFrames, setInAndOutFrames] =
		useState<TimelineInOutContextValue>({
			inFrame: null,
			outFrame: null,
		});

	const setTimelineInOutContextValue =
		useMemo((): SetTimelineInOutContextValue => {
			return {
				setInAndOutFrames,
			};
		}, []);

	return (
		<TimelineInOutContext.Provider value={inAndOutFrames}>
			<SetTimelineInOutContext.Provider value={setTimelineInOutContextValue}>
				{children}
			</SetTimelineInOutContext.Provider>
		</TimelineInOutContext.Provider>
	);
};
