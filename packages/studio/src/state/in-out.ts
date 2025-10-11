import type React from 'react';
import {createContext, useContext, useMemo} from 'react';
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

	const id = videoConfig?.id;
	const durationInFrames = videoConfig?.durationInFrames;

	return useMemo(() => {
		if (!id || !durationInFrames) {
			return {inFrame: null, outFrame: null};
		}

		const maxFrame = durationInFrames - 1;

		const actualInFrame = state[id]?.inFrame ?? null;
		const actualOutFrame = state[id]?.outFrame ?? null;

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
	}, [durationInFrames, id, state]);
};

export const useTimelineSetInOutFramePosition =
	(): SetTimelineInOutContextValue => {
		const {setInAndOutFrames} = useContext(SetTimelineInOutContext);
		return {setInAndOutFrames};
	};
