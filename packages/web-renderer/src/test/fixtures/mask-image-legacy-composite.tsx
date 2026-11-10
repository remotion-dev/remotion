import {AbsoluteFill} from 'remotion';
import {rasterMask} from './mask-image-url-sizing';

export const legacyMaskComposites = (
	[
		'clear',
		'copy',
		'source-over',
		'source-in',
		'source-out',
		'source-atop',
		'destination-over',
		'destination-in',
		'destination-out',
		'destination-atop',
		'xor',
	] as const
).map((composite) => {
	const Component = () => (
		<AbsoluteFill
			style={{
				backgroundColor: 'red',
				maskImage: `url("${rasterMask}"), url("${rasterMask}")`,
				WebkitMaskComposite: composite,
			}}
		/>
	);
	return {
		composite,
		composition: {
			component: Component,
			id: `legacy-mask-composite-${composite}`,
			width: 32,
			height: 16,
			fps: 25,
			durationInFrames: 1,
		},
	};
});
