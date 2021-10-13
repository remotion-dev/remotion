import React from 'react';
import {Sequence, useVideoConfig} from '..';

export type LoopProps = {
	children: React.ReactNode;
	// The duration of the content to be looped
	durationInFrames: number;
	// How many times to loop (optional, default Infinity)
	times?: number;
};

export const Loop: React.FC<LoopProps> = ({
	durationInFrames,
	times,
	children,
}) => {
	const video = useVideoConfig();

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

	if (times && times % 1 !== 0) {
		throw new TypeError(
			`The "times" prop of a loop must be an integer, but got ${times}.`
		);
	}

	const loopCount = times
		? times
		: Math.floor(video.durationInFrames / durationInFrames);
	return (
		<>
			{new Array(loopCount).fill('').map((_, index) => (
				<Sequence
					// eslint-disable-next-line react/no-array-index-key
					key={index}
					from={durationInFrames * index}
					durationInFrames={durationInFrames}
				>
					{children}
				</Sequence>
			))}
		</>
	);
};
