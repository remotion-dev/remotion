import type React from 'react';
import {createContext, useContext} from 'react';

export type TimelineInOutContextValue = {
	inFrame: number | null;
	outFrame: number | null;
};

export type SetTimelineInOutContextValue = {
	setInAndOutFrames: (
		u: React.SetStateAction<TimelineInOutContextValue>
	) => void;
};

export const TimelineInOutContext = createContext<TimelineInOutContextValue>({
	inFrame: null,
	outFrame: null,
});

export const SetTimelineInOutContext =
	createContext<SetTimelineInOutContextValue>({
		setInAndOutFrames: () => {
			throw new Error('default');
		},
	});

export const useTimelineInOutFramePosition = (): TimelineInOutContextValue => {
	const state = useContext(TimelineInOutContext);
	return state;
};

export const useTimelineSetInOutFramePosition =
	(): SetTimelineInOutContextValue => {
		const {setInAndOutFrames} = useContext(SetTimelineInOutContext);
		return {setInAndOutFrames};
	};
