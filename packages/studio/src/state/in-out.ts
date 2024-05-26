import type React from 'react';
import {createContext, useContext} from 'react';
import {Internals} from 'remotion';

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

export const TimelineInOutContext = createContext<TimelineInOutContextValue>(
	{},
);

export const SetTimelineInOutContext =
	createContext<SetTimelineInOutContextValue>({
		setInAndOutFrames: () => {
			throw new Error('default');
		},
	});

export const useTimelineInOutFramePosition = (): InOutValue => {
	const videoConfig = Internals.useUnsafeVideoConfig();
	const state = useContext(TimelineInOutContext);
	if (!videoConfig) {
		return {inFrame: null, outFrame: null};
	}

	const maxFrame = videoConfig.durationInFrames - 1;

	const actualInFrame = state[videoConfig.id]?.inFrame ?? null;
	const actualOutFrame = state[videoConfig.id]?.outFrame ?? null;

	return {
		inFrame:
			actualInFrame === null
				? null
				: actualInFrame >= maxFrame
					? null
					: actualInFrame,
		outFrame:
			actualOutFrame === null
				? null
				: actualOutFrame >= maxFrame
					? null
					: actualOutFrame,
	};
};

export const useTimelineSetInOutFramePosition =
	(): SetTimelineInOutContextValue => {
		const {setInAndOutFrames} = useContext(SetTimelineInOutContext);
		return {setInAndOutFrames};
	};
