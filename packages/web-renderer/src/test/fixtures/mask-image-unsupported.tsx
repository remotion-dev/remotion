import {AbsoluteFill} from 'remotion';

const values = [
	[
		'same-origin-token',
		'image-set(url("/mask-linear-gradient(red,blue).png") 1x)',
	],
	[
		'cross-origin-token',
		'image-set(url("https://example.com/linear-gradient(red,blue).png") 1x)',
	],
	['nested-gradient', 'image-set(linear-gradient(black, transparent) 1x)'],
	['ordinary-image-set', 'image-set(url("/mask-alpha)tile.png") 1x)'],
] as const;
export const unsupportedMaskImages = values.flatMap(([id, value]) =>
	[false, true].map((multiple) => {
		const maskImage = multiple ? `${value}, none` : value;
		const Component = () => (
			<AbsoluteFill style={{backgroundColor: 'red', maskImage}} />
		);
		return {
			maskImage,
			composition: {
				component: Component,
				id: `unsupported-mask-${id}-${multiple ? 'multiple' : 'single'}`,
				width: 40,
				height: 24,
				fps: 25,
				durationInFrames: 1,
			},
		};
	}),
);
