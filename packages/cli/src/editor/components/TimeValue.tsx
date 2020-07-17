import {useCurrentFrame, useVideoConfig} from '@jonny/motion-core';
import React from 'react';
import styled from 'styled-components';

const Text = styled.div`
	color: white;
	font-size: 24px;
	font-family: Arial, Helvetica, sans-serif;
`;

const renderFrame = (frame: number, fps: number): string => {
	const minutes = Math.floor(frame / fps / 60);
	const remainingSec = frame - minutes * fps * 60;
	const seconds = Math.floor(remainingSec / fps);
	const frameAfterSec = frame % fps;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
		2,
		'0'
	)}.${String(frameAfterSec).padStart(2, '0')}`;
};

export const TimeValue: React.FC = () => {
	const frame = useCurrentFrame();
	const config = useVideoConfig();

	return (
		<Text>
			{renderFrame(frame, config.fps)} ({frame})
		</Text>
	);
};
