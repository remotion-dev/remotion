import {
	Easing,
	interpolate,
	registerVideo,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import {Arc} from './Arc';
import {Atom} from './Atom';
import {Black} from './Black';
import {DotGrid} from './DotGrid';

export const ReactSvg: React.FC = () => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
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

	const scaleOutStart = 220;
	const scaleOutEnd = scaleOutStart + 50;

	const scaleIn = interpolate({
		input: frame,
		inputRange: [0, 30],
		outputRange: [1.2, 1],
		easing: Easing.ease,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const scaleOut = interpolate({
		input: frame,
		inputRange: [scaleOutStart, scaleOutEnd],
		outputRange: [1, 70],
		easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const scaleOutBlackDot = interpolate({
		input: frame,
		inputRange: [scaleOutStart, scaleOutStart + 10],
		outputRange: [0, 1],
		easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const scale = frame < 70 ? scaleIn : scaleOut;

	return (
		<div style={{flex: 1, backgroundColor: 'white'}}>
			<div
				style={{
					position: 'absolute',
					width: videoConfig.width,
					height: videoConfig.height,
					transform: `scale(${scale})`,
				}}
			>
				<DotGrid />
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
				<Black scale={scaleOutBlackDot} />
			</div>
		</div>
	);
};

registerVideo(ReactSvg, {
	width: 1920,
	height: 1080,
	durationInFrames: 300,
	fps: 60,
});
