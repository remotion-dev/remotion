import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {crosswarp} from '@remotion/transitions/crosswarp';
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

const letterStyle: React.CSSProperties = {
	position: 'relative',
	textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
};

const SceneA: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				...sceneStyle,
				backgroundColor: '#0b84f3',
			}}
		>
			<div style={letterStyle}>A</div>
		</AbsoluteFill>
	);
};

const SceneB: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				...sceneStyle,
				backgroundColor: '#ff4fa3',
			}}
		>
			<div style={letterStyle}>B</div>
		</AbsoluteFill>
	);
};

export const CrosswarpTransitionDoc: React.FC = () => {
	return (
		<AbsoluteFill style={{containerType: 'size'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneA />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={crosswarp({})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneB />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};

export const CrosswarpTransitionDocThumb: React.FC = () => {
	return (
		<AbsoluteFill style={{containerType: 'size'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={30}>
					<SceneA />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={crosswarp({})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneB />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
