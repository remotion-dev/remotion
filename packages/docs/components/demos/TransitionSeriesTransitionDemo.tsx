import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
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

const SceneC: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#2ecc71',
				fontFamily: 'sans-serif',
				fontWeight: 900,
				color: 'white',
				fontSize: 100,
			}}
		>
			C
		</AbsoluteFill>
	);
};

const presentations = {
	fade: () => fade(),
	slide: () => slide(),
	wipe: () => wipe(),
};

export const TransitionSeriesTransitionDemoComp: React.FC<{
	readonly presentation: string;
	readonly transitionDuration: number;
}> = ({presentation, transitionDuration}) => {
	const getPresentation =
		presentations[presentation as keyof typeof presentations] ??
		presentations.fade;

	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<SceneA />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: transitionDuration})}
				presentation={getPresentation()}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<SceneB />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: transitionDuration})}
				presentation={getPresentation()}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<SceneC />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
