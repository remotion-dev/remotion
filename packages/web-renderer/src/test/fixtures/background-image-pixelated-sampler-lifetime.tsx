import {AbsoluteFill} from 'remotion';
import {pixelatedRaster} from './background-image-url-pixelated';

export const createPixelatedBackgroundSamplerLifetime = (
	paintPixelated: boolean,
) => ({
	id: 'pixelated-sampler-lifetime',
	width: 64,
	height: 128,
	fps: 25,
	durationInFrames: 1,
	component: () => (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<div
				style={{
					position: 'absolute',
					width: 64,
					height: 64,
					backgroundImage: paintPixelated
						? `url("${pixelatedRaster}")`
						: 'none',
					backgroundSize: '16px 16px',
					imageRendering: 'pixelated',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					width: 64,
					height: 64,
					backgroundColor: 'white',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 64,
					width: 64,
					height: 64,
					backgroundImage: `url("${pixelatedRaster}")`,
					backgroundSize: '16px 16px',
					imageRendering: 'auto',
				}}
			/>
		</AbsoluteFill>
	),
});

export const pixelatedBackgroundSampler =
	createPixelatedBackgroundSamplerLifetime(true);
export const pixelatedBackgroundSamplerControl = {
	...createPixelatedBackgroundSamplerLifetime(false),
	id: 'pixelated-sampler-lifetime-control',
};
