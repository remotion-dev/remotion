import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {dreamyZoom} from '@remotion/transitions/dreamy-zoom';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';

const sceneStyle: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	fontFamily: 'sans-serif',
	fontWeight: 900,
	color: 'white',
	fontSize: '40cqmin',
};

const backgroundImageStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
	objectFit: 'cover',
};

const letterStyle: React.CSSProperties = {
	position: 'relative',
	textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
};

const SceneA: React.FC = () => {
	return (
		<AbsoluteFill style={sceneStyle}>
			<Img
				crossOrigin="anonymous"
				src="https://remotion.media/transition-bg-blue.jpg"
				style={backgroundImageStyle}
				alt=""
			/>
			<div style={letterStyle}>A</div>
		</AbsoluteFill>
	);
};

const SceneB: React.FC = () => {
	return (
		<AbsoluteFill style={sceneStyle}>
			<Img
				crossOrigin="anonymous"
				src="https://remotion.media/transition-bg-pink.jpg"
				style={backgroundImageStyle}
				alt=""
			/>
			<div style={letterStyle}>B</div>
		</AbsoluteFill>
	);
};

export const DreamyZoomTransitionPreview: React.FC = () => {
	return (
		<AbsoluteFill style={{containerType: 'size'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneA />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={dreamyZoom({})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneB />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};

export const DreamyZoomTransitionPreviewThumb: React.FC = () => {
	return (
		<AbsoluteFill style={{containerType: 'size'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={30}>
					<SceneA />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={dreamyZoom({})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneB />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
