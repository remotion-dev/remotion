import React from 'react';
import {AbsoluteFill, Img} from 'remotion';

const sceneStyle: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	fontFamily: 'sans-serif',
	fontWeight: 900,
	color: 'white',
	fontSize: 100,
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

export const SceneA: React.FC<{readonly small: boolean}> = ({small}) => {
	return (
		<AbsoluteFill style={sceneStyle}>
			<Img
				src={`https://remotion.media/transition-bg-blue${small ? '-small' : ''}.jpg`}
				crossOrigin="anonymous"
				style={backgroundImageStyle}
				alt=""
			/>
			<div style={letterStyle}>A</div>
		</AbsoluteFill>
	);
};

export const SceneB: React.FC<{readonly small: boolean}> = ({small}) => {
	return (
		<AbsoluteFill style={sceneStyle}>
			<Img
				src={`https://remotion.media/transition-bg-pink${small ? '-small' : ''}.jpg`}
				crossOrigin="anonymous"
				style={backgroundImageStyle}
				alt=""
			/>
			<div style={letterStyle}>B</div>
		</AbsoluteFill>
	);
};
