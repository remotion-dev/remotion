import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

const SceneA: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#0b84f3',
				fontFamily: 'sans-serif',
				fontWeight: 900,
				color: 'white',
				fontSize: 100,
			}}
		>
			A
		</AbsoluteFill>
	);
};

const SceneB: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'pink',
				fontFamily: 'sans-serif',
				fontWeight: 900,
				color: 'white',
				fontSize: 100,
			}}
		>
			B
		</AbsoluteFill>
	);
};

const Component: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={40}>
				<SceneA />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={clockWipe({width, height})}
				timing={linearTiming({durationInFrames: 30})}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<SceneB />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

export const transitionClockWipe = {
	component: Component,
	id: 'transition-clock-wipe',
	width: 540,
	height: 280,
	fps: 30,
	durationInFrames: 70,
} as const;
