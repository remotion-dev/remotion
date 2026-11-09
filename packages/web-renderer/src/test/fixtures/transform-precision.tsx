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
