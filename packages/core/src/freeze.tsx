import React, {useContext, useMemo} from 'react';
import type {SequenceContextType} from './SequenceContext.js';
import {SequenceContext} from './SequenceContext.js';
import type {TimelineContextValue} from './TimelineContext.js';
import {TimelineContext} from './TimelineContext.js';
import {useCurrentFrame} from './use-current-frame.js';
import {useVideoConfig} from './use-video-config.js';

type FreezeProps = {
	readonly frame: number;
	readonly children: React.ReactNode;
	readonly active?: boolean | ((f: number) => boolean);
};

/*
 * @description Freezes its children at the specified frame when rendering videos.
 * @see [Documentation](https://remotion.dev/docs/freeze)
 */
export const Freeze: React.FC<FreezeProps> = ({
	frame: frameToFreeze,
	children,
	active = true,
}) => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();

	if (typeof frameToFreeze === 'undefined') {
		throw new Error(
			`The <Freeze /> component requires a 'frame' prop, but none was passed.`,
		);
	}

	if (typeof frameToFreeze !== 'number') {
		throw new Error(
			`The 'frame' prop of <Freeze /> must be a number, but is of type ${typeof frameToFreeze}`,
		);
	}

	if (Number.isNaN(frameToFreeze)) {
		throw new Error(
			`The 'frame' prop of <Freeze /> must be a real number, but it is NaN.`,
		);
	}

	if (!Number.isFinite(frameToFreeze)) {
		throw new Error(
			`The 'frame' prop of <Freeze /> must be a finite number, but it is ${frameToFreeze}.`,
		);
	}

	const isActive = useMemo(() => {
		if (typeof active === 'boolean') {
			return active;
		}

		if (typeof active === 'function') {
			return active(frame);
		}
	}, [active, frame]);

	const timelineContext = useContext(TimelineContext);
	const sequenceContext = useContext(SequenceContext);

	const relativeFrom = sequenceContext?.relativeFrom ?? 0;

	const timelineValue: TimelineContextValue = useMemo(() => {
		if (!isActive) {
			return timelineContext;
		}

		return {
			...timelineContext,
			playing: false,
			imperativePlaying: {
				current: false,
			},
			frame: {
				[videoConfig.id]: frameToFreeze + relativeFrom,
			},
		};
	}, [isActive, timelineContext, videoConfig.id, frameToFreeze, relativeFrom]);

	const newSequenceContext: SequenceContextType | null = useMemo(() => {
		if (!sequenceContext) {
			return null;
		}

		if (!isActive) {
			return sequenceContext;
		}

		return {
			...sequenceContext,
			relativeFrom: 0,
			cumulatedFrom: 0,
		};
	}, [sequenceContext, isActive]);

	return (
		<TimelineContext.Provider value={timelineValue}>
			<SequenceContext.Provider value={newSequenceContext}>
				{children}
			</SequenceContext.Provider>
		</TimelineContext.Provider>
	);
};
