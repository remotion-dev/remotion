import {
	spring2,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	width: 100%;
	height: 100%;
`;

export const Transition: React.FC<{
	type: 'in' | 'out';
}> = ({type, children}) => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const springConfig: SpringConfig = {
		damping: 10,
		mass: 0.1,
		stiffness: 100,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		overshootClamping: true,
	};
	const firstFrame = videoConfig.durationInFrames - 4;
	const progress = spring2({
		config: springConfig,
		from: type === 'in' ? 100 : 0,
		to: type === 'in' ? 0 : 100,
		fps: videoConfig.fps,
		frame: type === 'in' ? frame : Math.max(0, frame - firstFrame),
	});

	return (
		<Container
			style={{
				transform: `translateX(${type === 'in' ? progress : 0 - progress}%)`,
			}}
		>
			{children}
		</Container>
	);
};
