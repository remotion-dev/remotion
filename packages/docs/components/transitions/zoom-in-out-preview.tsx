import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {zoomInOut} from '@remotion/transitions/zoom-in-out';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const sceneStyle: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	fontFamily: 'sans-serif',
	fontWeight: 900,
	color: 'white',
	fontSize: '40cqmin',
	overflow: 'hidden',
};

const sceneAStyle: React.CSSProperties = {
	...sceneStyle,
	backgroundImage:
		'radial-gradient(circle at 25% 25%, #63c7ff 0%, transparent 38%), linear-gradient(135deg, #087ecc, #032444)',
};

const sceneBStyle: React.CSSProperties = {
	...sceneStyle,
	backgroundImage:
		'radial-gradient(circle at 75% 30%, #ffb0dc 0%, transparent 38%), linear-gradient(135deg, #d22a80, #4c0a42)',
};

const letterStyle: React.CSSProperties = {
	position: 'relative',
	textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
};

const SceneA: React.FC = () => {
	return (
		<AbsoluteFill style={sceneAStyle}>
			<div style={letterStyle}>A</div>
		</AbsoluteFill>
	);
};

const SceneB: React.FC = () => {
	return (
		<AbsoluteFill style={sceneBStyle}>
			<div style={letterStyle}>B</div>
		</AbsoluteFill>
	);
};

export const ZoomInOutTransitionPreview: React.FC = () => {
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

export const ZoomInOutTransitionPreviewThumb: React.FC = () => {
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
