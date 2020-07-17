import {
	Easing,
	interpolate,
	registerVideo,
	useCurrentFrame,
} from '@jonny/motion-core';
import React from 'react';
import {Arc} from './Arc';
import {Atom} from './Atom';

export const ReactSvg: React.FC = () => {
	const frame = useCurrentFrame();
	const start = 0;
	const developDuration = 60;
	const development = interpolate({
		input: frame,
		inputRange: [start, developDuration + start],
		outputRange: [0, 1],
		easing: Easing.bezier(0.12, 1, 1, 1),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const rotateStart = developDuration + 5;
	const rotateDuration = 40;
	const rotationDevelopment = interpolate({
		input: frame,
		inputRange: [rotateStart, rotateStart + rotateDuration],
		outputRange: [0, 1],
		easing: Easing.bezier(0.12, 1, 1, 1),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const electronStart = 0;
	const electronDuration = 1000;
	const electronDevelopment = interpolate({
		input: frame,
		inputRange: [electronStart, electronStart + electronDuration],
		outputRange: [0, 10],
		extrapolateLeft: 'extend',
		extrapolateRight: 'extend',
	});

	const electronOpacity = interpolate({
		input: frame,
		inputRange: [rotateStart, rotateStart + 20],
		outputRange: [0, 1],
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div style={{flex: 1, backgroundColor: 'white'}}>
			<Arc
				rotateProgress={rotationDevelopment}
				progress={development}
				rotation={30}
				electronProgress={electronDevelopment}
				electronOpacity={electronOpacity}
			/>
			<Arc
				rotateProgress={rotationDevelopment}
				rotation={90}
				progress={frame < rotateStart ? 0 : 1}
				electronProgress={electronDevelopment * 1.2 + 0.33}
				electronOpacity={electronOpacity}
			/>
			<Arc
				rotateProgress={rotationDevelopment}
				rotation={-30}
				progress={frame < rotateStart ? 0 : 1}
				electronProgress={electronDevelopment + 0.66}
				electronOpacity={electronOpacity}
			/>
			<Atom scale={rotationDevelopment} />
		</div>
	);
};

registerVideo(ReactSvg, {
	width: 1920,
	height: 1080,
	durationInFrames: 300,
	fps: 60,
});
