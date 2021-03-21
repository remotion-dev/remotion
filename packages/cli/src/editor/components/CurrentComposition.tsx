import React from 'react';
import {Internals} from 'remotion';
import styled from 'styled-components';
import {renderFrame} from '../state/render-frame';
import {Thumbnail} from './Thumbnail';

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

const Row = styled.div`
	display: flex;
	flex-direction: row;
`;

const Space = styled.div`
	width: 12px;
`;

export const CurrentComposition = () => {
	const video = Internals.useVideo();
	if (!video) {
		return <Container />;
	}
	return (
		<Container>
			<Row>
				<Thumbnail composition={video} />
				<Space />
				<div>
					<Title>{video.id}</Title>
					<Subtitle>
						{video.width}x{video.height}, {video.fps} FPS
					</Subtitle>
					<Subtitle>
						Duration {renderFrame(video.durationInFrames, video.fps)}
					</Subtitle>
				</div>
			</Row>
		</Container>
	);
};
