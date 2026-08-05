import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';

const Canvas: React.FC<{color: string}> = ({color}) => {
	const ref = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		const context = ref.current?.getContext('2d');
		if (!context) {
			return;
		}

		context.fillStyle = color;
		context.fillRect(0, 0, 200, 200);
	}, [color]);

	return (
		<canvas
			ref={ref}
			width={200}
			height={200}
			style={{
				position: 'absolute',
				width: 200,
				height: 200,
				left: 0,
				top: 0,
				objectFit: 'cover',
				maxWidth: 'unset',
			}}
		/>
	);
};

const Component: React.FC = () => {
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transform: 'rotate(0deg)',
					opacity: 0.3,
					overflow: 'hidden',
				}}
			>
				<Canvas color="blue" />
			</div>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transform: 'rotate(0deg)',
					opacity: 1,
					overflow: 'hidden',
				}}
			>
				<Canvas color="red" />
			</div>
		</AbsoluteFill>
	);
};

export const opaqueLayerOverFadingLayer = {
	component: Component,
	id: 'opaque-layer-over-fading-layer',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
