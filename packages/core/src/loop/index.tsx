import React, {useContext, useMemo} from 'react';
import {
	TimelineContext,
	TimelineContextValue,
} from '../timeline-position-state';

export type LoopProps = {
	children: React.ReactNode;
	// The duration of the content to be looped
	durationInFrames: number;
	// How many times to loop (optional, default Infinity)
	times?: number;
};

export const Loop: React.FC<LoopProps> = ({
	durationInFrames,
	times = Infinity,
	children,
}) => {
	const context = useContext(TimelineContext);
	const {frame} = context;

	if (typeof durationInFrames !== 'number') {
		throw new TypeError(
			`You passed to durationInFrames an argument of type ${typeof durationInFrames}, but it must be a number.`
		);
	}

	if (durationInFrames <= 0) {
		throw new TypeError(
			`durationInFrames must be positive, but got ${durationInFrames}.`
		);
	}

	// Infinity is non-integer but allowed!
	if (durationInFrames % 1 !== 0 && Number.isFinite(durationInFrames)) {
		throw new TypeError(
			`The "durationInFrames" of a loop must be an integer, but got ${durationInFrames}.`
		);
	}

	if (times && typeof times !== 'number') {
		throw new TypeError(
			`You passed to "times" an argument of type ${typeof times}, but it must be a number.`
		);
	}

	if (times !== Infinity && times % 1 !== 0) {
		throw new TypeError(
			`The "times" prop of a loop must be an integer, but got ${times}.`
		);
	}

	const value: TimelineContextValue = useMemo(() => {
		// Number of loops of the durationInFrames to this frame
		const loopsToThisFrame = Math.floor(frame / durationInFrames);
		const currentFrame =
			loopsToThisFrame < times ? frame % durationInFrames : frame;

		return {
			...context,
			frame: currentFrame,
		};
	}, [context, frame, durationInFrames, times]);

	return (
		<TimelineContext.Provider value={value}>
			{children}
		</TimelineContext.Provider>
	);
};
