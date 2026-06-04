import {AbsoluteFill, usePixelDensity} from 'remotion';

const Component = () => {
	const pixelDensity = usePixelDensity();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: `rgb(${Math.round(pixelDensity * 100)}, 0, 0)`,
			}}
		/>
	);
};

export const pixelDensity = {
	component: Component,
	id: 'pixel-density',
	width: 100,
	height: 100,
	fps: 25,
	durationInFrames: 1,
} as const;
