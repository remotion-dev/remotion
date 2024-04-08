import React, {useMemo} from 'react';
import type {LoopDisplay} from '../CompositionManager.js';
import type {LayoutAndStyle} from '../Sequence.js';
import {Sequence} from '../Sequence.js';
import {useCurrentFrame} from '../use-current-frame.js';
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
	const currentFrame = useCurrentFrame();
	const {durationInFrames: compDuration} = useVideoConfig();

	validateDurationInFrames(durationInFrames, {
		component: 'of the <Loop /> component',
		allowFloats: true,
	});

	if (typeof times !== 'number') {
		throw new TypeError(
			`You passed to "times" an argument of type ${typeof times}, but it must be a number.`,
		);
	}

	if (times !== Infinity && times % 1 !== 0) {
		throw new TypeError(
			`The "times" prop of a loop must be an integer, but got ${times}.`,
		);
	}

	if (times < 0) {
		throw new TypeError(
			`The "times" prop of a loop must be at least 0, but got ${times}`,
		);
	}

	const maxTimes = Math.ceil(compDuration / durationInFrames);
	const actualTimes = Math.min(maxTimes, times);
	const style = props.layout === 'none' ? undefined : props.style;
	const maxFrame = durationInFrames * (actualTimes - 1);
	const start = Math.floor(currentFrame / durationInFrames) * durationInFrames;
	const from = Math.min(start, maxFrame);

	const loopDisplay: LoopDisplay = useMemo(() => {
		return {
			numberOfTimes: actualTimes,
			startOffset: -from,
			durationInFrames,
		};
	}, [actualTimes, durationInFrames, from]);

	return (
		<Sequence
			durationInFrames={durationInFrames}
			from={from}
			name={name ?? '<Loop>'}
			_remotionInternalLoopDisplay={loopDisplay}
			layout={props.layout}
			style={style}
		>
			{children}
		</Sequence>
	);
};
