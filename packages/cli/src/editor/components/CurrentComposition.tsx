import React, {useContext} from 'react';
import {CompositionManager, useVideoConfig} from 'remotion';
import {renderFrame} from '../state/render-frame';

const container: React.CSSProperties = {
	minHeight: 100,
	display: 'block',
	borderBottom: '1px solid black',
	padding: 16,
	color: 'white',
	lineHeight: 18,
};

const title: React.CSSProperties = {
	fontWeight: 'bold',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
};

const subtitle: React.CSSProperties = {
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	opacity: 0.8,
};

export const CurrentComposition = () => {
	const {currentComposition} = useContext(CompositionManager);
	const videoConfig = useVideoConfig();
	if (!currentComposition) {
		return <div style={container} />;
	}
	return (
		<div style={container}>
			<div style={title}>{currentComposition}</div>
			<div style={subtitle}>
				{videoConfig.width}x{videoConfig.height}
			</div>
			<div style={subtitle}>
				Duration {renderFrame(videoConfig.durationInFrames, videoConfig.fps)},{' '}
				{videoConfig.fps} FPS
			</div>
		</div>
	);
};
