import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {zoomInOut} from '@remotion/transitions/zoom-in-out';
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
				fontSize: '40cqmin',
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
				fontSize: '40cqmin',
			}}
		>
			B
		</AbsoluteFill>
	);
};

export const ZoomInOutTransitionDoc: React.FC = () => {
	return (
		<AbsoluteFill style={{containerType: 'size'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneA />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={zoomInOut({})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneB />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};

export const ZoomInOutTransitionDocThumb: React.FC = () => {
	return (
		<AbsoluteFill style={{containerType: 'size'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={30}>
					<SceneA />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={zoomInOut({})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneB />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
