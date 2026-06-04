import {AbsoluteFill, usePixelDensity} from 'remotion';

const Component = () => {
	const currentPixelDensity = usePixelDensity();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: `rgb(${Math.round(currentPixelDensity * 100)}, 0, 0)`,
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
