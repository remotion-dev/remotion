import {createContext, useContext} from 'react';

export type TimelineInOutContextValue = {
	inFrame: number | null;
	outFrame: number | null;
};

export type SetTimelineInOutContextValue = {
	setInFrame: (u: React.SetStateAction<number | null>) => void;
	setOutFrame: (u: React.SetStateAction<number | null>) => void;
};

export const TimelineInOutContext = createContext<TimelineInOutContextValue>({
	inFrame: null,
	outFrame: null,
});

export const SetTimelineInOutContext = createContext<
	SetTimelineInOutContextValue
>({
	setInFrame: () => {
		throw new Error('default');
	},
	setOutFrame: () => {
		throw new Error('default');
	},
});

export const useTimelineInOutFramePosition = (): TimelineInOutContextValue => {
	const state = useContext(TimelineInOutContext);
	return state;
};

export const useTimelineSetInOutFramePosition = (): SetTimelineInOutContextValue => {
	const {setInFrame, setOutFrame} = useContext(SetTimelineInOutContext);
	return {setInFrame, setOutFrame};
};
