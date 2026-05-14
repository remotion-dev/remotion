import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {wipe} from '@remotion/transitions/wipe';
import React from 'react';
import {AbsoluteFill} from 'remotion';

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
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={40}>
				<SceneA />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={wipe()}
				timing={linearTiming({durationInFrames: 30})}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<SceneB />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

export const transitionWipe = {
	component: Component,
	id: 'transition-wipe',
	width: 540,
	height: 280,
	fps: 30,
	durationInFrames: 70,
} as const;
