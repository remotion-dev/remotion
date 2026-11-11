import {PlayerInternals} from '@remotion/player';
import type React from 'react';
import {createContext, useContext} from 'react';

export type InOutValue = {
	inFrame: number | null;
	outFrame: number | null;
};

export type TimelineInOutContextValue = Record<string, InOutValue>;

export type SetTimelineInOutContextValue = {
	setInAndOutFrames: (
		u: React.SetStateAction<TimelineInOutContextValue>,
	) => void;
};

export const SetTimelineInOutContext =
	createContext<SetTimelineInOutContextValue>({
		setInAndOutFrames: () => {
			throw new Error('default');
		},
	});

export const useTimelineInOutFramePosition = (): InOutValue =>
	useContext(PlayerInternals.PlaybackRangeContext);

export const useTimelineSetInOutFramePosition =
	(): SetTimelineInOutContextValue => {
		const {setInAndOutFrames} = useContext(SetTimelineInOutContext);
		return {setInAndOutFrames};
	};
