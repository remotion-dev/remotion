import {
	interpolate,
	spring2,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
	position: absolute;
`;

export const Device: React.FC<{
	top: number;
	rotationAmount: number;
	fruit: string;
}> = ({top, rotationAmount, fruit = 'kiwi'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const springConfig: SpringConfig = {
		damping: 100,
		mass: 2.4,
		stiffness: 10,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		overshootClamping: true,
	};
	const rotationProgress = spring2({
		config: springConfig,
		from: 0,
		to: 1,
		fps,
		frame: frame - Math.floor(rotationAmount * 4) + 15,
	});

	const translateProgress = spring2({
		config: springConfig,
		from: 0,
		to: 1,
		fps,
		frame: frame + 15,
	});

	const animationFrame = Math.max(
		1,
		Math.floor(
			interpolate({
				inputRange: [0.3, 1],
				outputRange: [0, 40],
				input: rotationProgress,
				extrapolateLeft: 'clamp',
			}) * rotationAmount
		)
	);

	const src = require('./' +
		fruit +
		'-light/Untitled Frame ' +
		animationFrame +
		'.png').default;
	const bottomPoint = 1300;

	const scale = rotationAmount * 0.2 + 0.8;

	return (
		<Container
			style={{
				top: bottomPoint - translateProgress * (bottomPoint - top) - 100,
				transform: `scale(${scale})`,
			}}
		>
			<img src={src} />
		</Container>
	);
};
