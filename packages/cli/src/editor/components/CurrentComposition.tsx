import React, {useContext} from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {renderFrame} from '../state/render-frame';

const Container = styled.div`
	min-height: 100px;
	display: block;
	border-bottom: 1px solid black;
	padding: 16px;
	color: white;
	line-height: 18px;
`;

const Title = styled.div`
	font-weight: bold;
	font-family: Arial, Helvetica, sans-serif;
	font-size: 12px;
`;

const Subtitle = styled.div`
	font-family: Arial, Helvetica, sans-serif;
	font-size: 12px;
	opacity: 0.8;
`;

export const CurrentComposition = () => {
	const {currentComposition} = useContext(Internals.CompositionManager);
	const videoConfig = Internals.useUnsafeVideoConfig();
	if (!videoConfig) {
		return <Container />;
	}
	return (
		<Container>
			<Title>{currentComposition}</Title>
			<Subtitle>
				{videoConfig.width}x{videoConfig.height}
			</Subtitle>
			<Subtitle>
				Duration {renderFrame(videoConfig.durationInFrames, videoConfig.fps)},{' '}
				{videoConfig.fps} FPS
			</Subtitle>
		</Container>
	);
};
