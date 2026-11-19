import React, {createContext, useContext, useMemo} from 'react';
import {useClientAudioSample} from '../client-audio-sample.js';
import type {LoopDisplay} from '../CompositionManager.js';
import type {LayoutAndStyle, SequenceProps} from '../Sequence.js';
import {Sequence} from '../Sequence.js';
import {SequenceContext} from '../SequenceContext.js';
import {useTimelinePosition} from '../timeline-position-state.js';
import {TimelineContext} from '../TimelineContext.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useVideoConfig} from '../use-video-config.js';
import {validateDurationInFrames} from '../validation/validate-duration-in-frames.js';
import {LoopContext, type LoopContextType} from './loop-context.js';

export type LoopProps = {
	// The duration of the content to be looped
	readonly durationInFrames: number;
	// How many times to loop (optional, default Infinity)
	readonly times?: number;
	readonly name?: string;
	readonly children: React.ReactNode;
} & LayoutAndStyle &
	Pick<SequenceProps, 'showInTimeline' | 'playbackRate'>;

export const LoopTimelineContext = createContext<{
	startFrame: number;
	firstVisibleFrame: number;
	endFrame: number;
	playbackRate: number;
} | null>(null);

const useLoop = () => {
	return React.useContext(LoopContext);
};

/*
 * @description This component allows you to quickly lay out an animation so it repeats itself.
 * @see [Documentation](https://remotion.dev/docs/loop)
 */
export const Loop: React.FC<LoopProps> & {
	useLoop: typeof useLoop;
} = ({
	durationInFrames,
	times = Infinity,
	children,
	name,
	showInTimeline,
	playbackRate,
	...props
}) => {
	const audioSample = useClientAudioSample();
	const localFrame = useCurrentFrame();
	const publicFrame = useTimelinePosition();
	const {durationInFrames: compDuration} = useVideoConfig();
	const parentSequence = useContext(SequenceContext);
	const parentPlaybackRate = parentSequence?.playbackRate ?? 1;
	const currentFrame =
		localFrame + (audioSample.frame - publicFrame) * parentPlaybackRate;
	const playbackRateValue = playbackRate ?? 1;
	const iterationDurationInFrames = durationInFrames / playbackRateValue;
	const loopStartFrame = parentSequence
		? parentSequence.cumulatedFrom + parentSequence.relativeFrom
		: 0;
	const firstVisibleFrame =
		loopStartFrame -
		(parentSequence?.cumulatedNegativeFrom ?? 0) / parentPlaybackRate;
	const endFrame =
		loopStartFrame +
		Math.min(compDuration, iterationDurationInFrames * times) /
			parentPlaybackRate;

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

	const maxTimes = Math.ceil(compDuration / iterationDurationInFrames);
	const actualTimes = Math.min(maxTimes, times);
	const maxFrame = iterationDurationInFrames * (actualTimes - 1);
	const loopsElapsed = currentFrame / iterationDurationInFrames;
	const nearestIteration = Math.round(loopsElapsed);
	// Fractional durations and nested playback rates can put an exact loop
	// boundary a few floating-point units before the next iteration.
	const isAtBoundary =
		Math.abs(loopsElapsed - nearestIteration) <=
		Number.EPSILON * Math.max(1, Math.abs(loopsElapsed)) * 4;
	const iteration =
		audioSample.iteration ??
		Math.max(
			0,
			Math.min(
				actualTimes - 1,
				isAtBoundary ? nearestIteration : Math.floor(loopsElapsed),
			),
		);
	const start =
		audioSample.iteration === null && isAtBoundary
			? currentFrame
			: iteration * iterationDurationInFrames;
	const from = Math.max(0, Math.min(start, maxFrame));

	const loopDisplay: LoopDisplay = useMemo(() => {
		return {
			numberOfTimes: Math.min(compDuration / iterationDurationInFrames, times),
			startOffset: -from,
			durationInFrames: iterationDurationInFrames,
		};
	}, [compDuration, from, iterationDurationInFrames, times]);

	const loopContext: LoopContextType = useMemo(() => {
		return {
			iteration,
			durationInFrames,
		};
	}, [iteration, durationInFrames]);
	const timelineContext = useMemo(
		() => ({
			startFrame: loopStartFrame,
			firstVisibleFrame,
			endFrame,
			playbackRate: parentPlaybackRate,
		}),
		[loopStartFrame, firstVisibleFrame, endFrame, parentPlaybackRate],
	);

	const boundary =
		loopStartFrame +
		((iteration + 1) * iterationDurationInFrames) / parentPlaybackRate;
	const {enabled, sampleAt, reset} = audioSample;
	const boundaryTolerance =
		Number.EPSILON * Math.max(1, Math.abs(boundary), Math.abs(endFrame)) * 4;
	const audioBoundary = useMemo(
		() =>
			enabled && endFrame - boundary > boundaryTolerance
				? {
						frame: boundary,
						advance: () => sampleAt(boundary, iteration + 1),
						reset,
					}
				: null,
		[
			enabled,
			boundary,
			endFrame,
			boundaryTolerance,
			sampleAt,
			iteration,
			reset,
		],
	);

	if (actualTimes === 0) {
		return null;
	}

	const content = (
		<LoopTimelineContext.Provider value={timelineContext}>
			<LoopContext.Provider value={loopContext}>
				<Sequence
					durationInFrames={durationInFrames}
					from={from}
					name={name ?? '<Loop>'}
					_remotionInternalDocumentationLink="https://www.remotion.dev/docs/loop"
					_remotionInternalLoopDisplay={loopDisplay}
					_remotionInternalClientAudioLoop={audioBoundary}
					{...props}
					showInTimeline={showInTimeline}
					playbackRate={playbackRate}
				>
					{children}
				</Sequence>
			</LoopContext.Provider>
		</LoopTimelineContext.Provider>
	);
	return (
		<TimelineContext.Provider value={audioSample.timeline}>
			{content}
		</TimelineContext.Provider>
	);
};

Loop.useLoop = useLoop;
