import {AbsoluteFill} from 'remotion';

export const transformPrecisionValues = [
	'rotate(15deg)',
	'rotate(-10deg) scale(1.4,.8)',
	'skew(11.25deg,-7.125deg) translate(12.125px,3.875px)',
	'rotateX(20deg) rotateY(15deg)',
	'translate(10%,20%) rotate(15deg)',
] as const;

const Component = () => (
	<AbsoluteFill>
		{transformPrecisionValues.map((transform, index) => (
			<div
				key={transform}
				style={{
					position: 'absolute',
					left: 35 + index * 150,
					top: 45,
					width: 100,
					height: 80,
					transformOrigin: '0 0',
					transform,
					backgroundColor: 'rgb(40,80,220)',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 10,
						backgroundColor: 'rgb(220,80,40)',
					}}
				/>
			</div>
		))}
	</AbsoluteFill>
);

export const transformPrecision = {
	component: Component,
	id: 'transform-precision',
	width: 800,
	height: 180,
	fps: 30,
	durationInFrames: 1,
} as const;

export const geometric2dTransforms = [
	'scale(.005) rotateX(0deg)',
	'scale(.005) rotateY(0deg)',
] as const;
const Geometric2d = () => (
	<AbsoluteFill style={{backgroundColor: 'black'}}>
		{geometric2dTransforms.map((transform, index) => (
			<div
				key={transform}
				style={{
					position: 'absolute',
					left: index * 60,
					top: 0,
					width: 10000,
					height: 10000,
					backgroundColor: 'red',
					transformOrigin: '0 0',
					transform,
				}}
			/>
		))}
	</AbsoluteFill>
);
export const transformGeometric2d = {
	component: Geometric2d,
	id: 'transform-geometric-2d',
	width: 120,
	height: 100,
	fps: 30,
	durationInFrames: 2,
} as const;
