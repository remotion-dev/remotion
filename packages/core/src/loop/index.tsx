import React from 'react';
import type {LayoutAndStyle} from '../Sequence.js';
import {Sequence} from '../Sequence.js';
import {useVideoConfig} from '../use-video-config.js';
import {validateDurationInFrames} from '../validation/validate-duration-in-frames.js';

export type LoopProps = {
	// The duration of the content to be looped
	durationInFrames: number;
	// How many times to loop (optional, default Infinity)
	times?: number;
	name?: string;
	children: React.ReactNode;
} & LayoutAndStyle;

/**
 * @description This component allows you to quickly lay out an animation so it repeats itself.
 * @see [Documentation](https://www.remotion.dev/docs/loop)
 */
export const Loop: React.FC<LoopProps> = ({
	durationInFrames,
	times = Infinity,
	children,
	name,
	...props
}) => {
	const {durationInFrames: compDuration} = useVideoConfig();
	validateDurationInFrames(durationInFrames, 'of the <Loop /> component');

	if (typeof times !== 'number') {
		throw new TypeError(
			`You passed to "times" an argument of type ${typeof times}, but it must be a number.`
		);
	}

	if (times !== Infinity && times % 1 !== 0) {
		throw new TypeError(
			`The "times" prop of a loop must be an integer, but got ${times}.`
		);
	}

	if (times < 0) {
		throw new TypeError(
			`The "times" prop of a loop must be at least 0, but got ${times}`
		);
	}

	const maxTimes = Math.ceil(compDuration / durationInFrames);
	const actualTimes = Math.min(maxTimes, times);
	const style = props.layout === 'none' ? undefined : props.style;

	return (
		<>
			{new Array(actualTimes).fill(true).map((_, i) => {
				return (
					<Sequence
						// eslint-disable-next-line react/no-array-index-key
						key={`loop-${i}`}
						durationInFrames={durationInFrames}
						from={i * durationInFrames}
						name={name}
						showLoopTimesInTimeline={actualTimes}
						showInTimeline={i === 0}
						layout={props.layout}
						style={style}
					>
						{children}
					</Sequence>
				);
			})}
		</>
	);
};
