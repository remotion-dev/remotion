import React, {createContext, useMemo} from 'react';
import type {LoopDisplay} from '../CompositionManager.js';
import type {LayoutAndStyle} from '../Sequence.js';
import {Sequence} from '../Sequence.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useVideoConfig} from '../use-video-config.js';
import {validateDurationInFrames} from '../validation/validate-duration-in-frames.js';

export type LoopProps = {
	// The duration of the content to be looped
	readonly durationInFrames: number;
	// How many times to loop (optional, default Infinity)
	readonly times?: number;
	readonly name?: string;
	readonly children: React.ReactNode;
} & LayoutAndStyle;

type LoopContextType = {
	iteration: number;
	durationInFrames: number;
};

const LoopContext = createContext<LoopContextType | null>(null);

const useLoop = () => {
	return React.useContext(LoopContext);
};

/*
 * @description This component allows you to quickly lay out an animation so it repeats itself.
 * @see [Documentation](https://remotion.dev/docs/loop)
 */
export const Loop: React.FC<LoopProps> & {
	useLoop: typeof useLoop;
} = ({durationInFrames, times = Infinity, children, name, ...props}) => {
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
	const iteration = Math.floor(currentFrame / durationInFrames);
	const start = iteration * durationInFrames;
	const from = Math.min(start, maxFrame);

	const loopDisplay: LoopDisplay = useMemo(() => {
		return {
			numberOfTimes: actualTimes,
			startOffset: -from,
			durationInFrames,
		};
	}, [actualTimes, durationInFrames, from]);

	const loopContext: LoopContextType = useMemo(() => {
		return {
			iteration: Math.floor(currentFrame / durationInFrames),
			durationInFrames,
		};
	}, [currentFrame, durationInFrames]);

	return (
		<LoopContext.Provider value={loopContext}>
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
		</LoopContext.Provider>
	);
};

Loop.useLoop = useLoop;
