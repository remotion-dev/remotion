import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {bookFlip} from '@remotion/transitions/book-flip';
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

const SceneA: React.FC<{readonly small: boolean}> = ({small}) => {
	return (
		<AbsoluteFill style={sceneStyle}>
			<Img
				crossOrigin="anonymous"
				src={`https://remotion.media/transition-bg-blue${small ? '-small' : ''}.jpg`}
				style={backgroundImageStyle}
				alt=""
			/>
			<div style={letterStyle}>A</div>
		</AbsoluteFill>
	);
};

const SceneB: React.FC<{readonly small: boolean}> = ({small}) => {
	return (
		<AbsoluteFill style={sceneStyle}>
			<Img
				crossOrigin="anonymous"
				src={`https://remotion.media/transition-bg-pink${small ? '-small' : ''}.jpg`}
				style={backgroundImageStyle}
				alt=""
			/>
			<div style={letterStyle}>B</div>
		</AbsoluteFill>
	);
};

export const BookFlipTransitionDoc: React.FC = () => {
	return (
		<AbsoluteFill style={{containerType: 'size'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneA small={false} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={bookFlip({})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneB small={false} />
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
					<SceneA small />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={bookFlip({})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence durationInFrames={60}>
					<SceneB small />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
