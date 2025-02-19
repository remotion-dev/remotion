import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Arc} from './Arc';
import {Atom} from './Atom';
import {Black} from './Black';
import {DotGrid} from './DotGrid';

const ReactSvg: React.FC<{
	readonly transparent: boolean;
}> = ({transparent}) => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const start = 0;
	const developDuration = 60;
	const development = interpolate(
		frame,
		[start, developDuration + start],
		[0, 1],
		{
			easing: Easing.bezier(0.12, 1, 1, 1),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	const rotateStart = developDuration + 5;
	const rotateDuration = 40;
	const rotationDevelopment = interpolate(
		frame,
		[rotateStart, rotateStart + rotateDuration],
		[0, 1],
		{
			easing: Easing.bezier(0.12, 1, 1, 1),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	const electronStart = 0;
	const electronDuration = 1000;
	const electronDevelopment = interpolate(
		frame,
		[electronStart, electronStart + electronDuration],
		[0, 10],
	);

	const electronOpacity = interpolate(
		frame,
		[rotateStart, rotateStart + 20],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	const scaleOutStart = 220;
	const scaleOutEnd = scaleOutStart + 50;

	const scaleIn = interpolate(frame, [0, 30], [1.2, 1], {
		easing: Easing.ease,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const scaleOut = interpolate(frame, [scaleOutStart, scaleOutEnd], [1, 70], {
		easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const scaleOutBlackDot = interpolate(
		frame,
		[scaleOutStart, scaleOutStart + 10],
		[0, 1],
		{
			easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	const scale = frame < 70 ? scaleIn : scaleOut;

	return (
		<>
			<div
				style={{flex: 1, backgroundColor: transparent ? undefined : 'white'}}
			>
				<div
					style={{
						position: 'absolute',
						width: videoConfig.width,
						height: videoConfig.height,
						transform: `scale(${scale})`,
					}}
				>
					{transparent ? null : <DotGrid />}
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
					{transparent ? null : <Black scale={scaleOutBlackDot} />}
				</div>
			</div>
		</>
	);
};

export default ReactSvg;
