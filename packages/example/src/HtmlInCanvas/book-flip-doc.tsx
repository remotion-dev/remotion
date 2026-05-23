import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {bookFlip} from '@remotion/transitions/book-flip';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const sceneStyle: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	fontFamily: 'sans-serif',
	fontWeight: 900,
	color: 'white',
	fontSize: '40cqmin',
};

const SceneA: React.FC = () => {
	return (
		<AbsoluteFill style={{...sceneStyle, backgroundColor: '#0b84f3'}}>
			A
		</AbsoluteFill>
	);
};

const SceneB: React.FC = () => {
	return (
		<AbsoluteFill style={{...sceneStyle, backgroundColor: 'pink'}}>
			B
		</AbsoluteFill>
	);
};

export const BookFlipTransitionDoc: React.FC = () => {
	return (
		<AbsoluteFill style={{containerType: 'size'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneA />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={bookFlip({})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneB />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};

export const BookFlipTransitionDocThumb: React.FC = () => {
	return (
		<AbsoluteFill style={{containerType: 'size'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={30}>
					<SceneA />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={bookFlip({})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneB />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
