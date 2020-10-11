import {
	interpolate,
	registerVideo,
	spring2,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import {mix} from 'polished';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
	background-color: white;
	flex: 1;
`;

const Label = styled.div`
	font-size: 130px;
	color: black;
	font-weight: 900;
	font-family: 'Helvetica Neue';
	text-align: center;
	transform: scaleX(1);
	letter-spacing: 0.15em;
	-webkit-text-fill-color: white; /* Will override color (regardless of order) */
	-webkit-text-stroke-width: 6px;
	-webkit-text-stroke-color: black;
	line-height: 1em;
	margin-left: 30px;
`;
export const StaggerType = () => {
	const types = 9;
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const springConfig: SpringConfig = {
		damping: 10,
		mass: 1.4,
		stiffness: 100,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		overshootClamping: false,
	};
	const progress = spring2({
		config: springConfig,
		frame,
		from: 0,
		to: 1,
		fps: videoConfig.fps,
	});
	const letterSpacing =
		interpolate({
			input: progress,
			inputRange: [0, 1],
			outputRange: [0.5, 0.15],
		}) + 'em';
	return (
		<Container
			style={{
				flex: 1,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div>
				{new Array(types)
					.fill(true)
					.map((_, i) => {
						return i;
					})
					.map((i) => {
						const ratio = i / types;
						const opacity = frame / videoConfig.durationInFrames > ratio;
						const color = mix(ratio, '#fff', '#000');
						return (
							<Label
								style={{
									WebkitTextStrokeColor: color,
									opacity: Number(opacity),
									letterSpacing,
									width: 2000,
									marginLeft: -(2000 - videoConfig.width) / 2 + 15,
								}}
							>
								{'ANYSTICKER'}
							</Label>
						);
					})}
			</div>
		</Container>
	);
};

registerVideo(StaggerType, {
	width: 1080,
	height: 1920,
	fps: 30,
	durationInFrames: 30 * 1.5,
});
