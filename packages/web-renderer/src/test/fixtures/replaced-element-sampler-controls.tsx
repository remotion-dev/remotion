import {AbsoluteFill, Img} from 'remotion';
import {pixelatedReplacedRaster} from './replaced-element-pixelated';
import {svgUrlBlurredCover} from './svg-url-nonzero-viewbox';

export const createReplacedSamplerSibling = (pixelated: boolean) => ({
	component: () => (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Img
				src={pixelatedReplacedRaster}
				style={{
					width: 64,
					height: 64,
					imageRendering: pixelated ? 'pixelated' : 'auto',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 64,
					height: 64,
					backgroundColor: 'white',
				}}
			/>
			<Img
				src={pixelatedReplacedRaster}
				style={{
					position: 'absolute',
					left: 72,
					top: 0,
					width: 64,
					height: 64,
					imageRendering: 'auto',
				}}
			/>
		</AbsoluteFill>
	),
	id: 'replaced-sampler-sibling',
	width: 144,
	height: 64,
	fps: 25,
	durationInFrames: 1,
});

export const createSvgSamplerInvariant = (pixelated: boolean) => ({
	...svgUrlBlurredCover,
	width: 160,
	height: 160,
	component: () => (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<div
				style={{
					position: 'absolute',
					left: 8,
					top: 8,
					width: 80,
					height: 80,
					transform: 'scale(1.5)',
					transformOrigin: '0 0',
					imageRendering: pixelated ? 'pixelated' : 'auto',
				}}
			>
				<svgUrlBlurredCover.component />
			</div>
		</AbsoluteFill>
	),
});

export const replacedSamplerPixelated = createReplacedSamplerSibling(true);
export const replacedSamplerAuto = {
	...createReplacedSamplerSibling(false),
	id: 'replaced-sampler-sibling-auto',
};
export const svgSamplerPixelated = {
	...createSvgSamplerInvariant(true),
	id: 'svg-sampler-pixelated',
};
export const svgSamplerAuto = {
	...createSvgSamplerInvariant(false),
	id: 'svg-sampler-auto',
};
