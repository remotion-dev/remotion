import {AbsoluteFill} from 'remotion';
import {
	SvgFontFamilyLifetimeScene,
	svgFontFamilyLifetimeFamily,
} from './svg-font-family-lifetime';

export const svgReadbackBoundsModes = [
	'large',
	'clipped',
	'rotated',
	'translucent',
	'outside',
] as const;

export const svgReadbackBounds = (
	mode: (typeof svgReadbackBoundsModes)[number],
) => ({
	id: `svg-readback-bounds-${mode}`,
	width: mode === 'large' ? 7680 : 900,
	height: mode === 'large' ? 4320 : 240,
	fps: 30,
	durationInFrames: 1,
	component: () => (
		<AbsoluteFill
			style={{
				backgroundColor:
					mode === 'translucent' ? 'rgba(43,77,99,0.37)' : 'white',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: mode === 'outside' ? -1000 : 96,
					top: 64,
					width: mode === 'clipped' ? 320 : 680,
					height: mode === 'clipped' ? 70 : 100,
					overflow: mode === 'clipped' ? 'hidden' : 'visible',
					transform: mode === 'rotated' ? 'rotate(13deg)' : 'none',
					transformOrigin: '0 0',
				}}
			>
				<SvgFontFamilyLifetimeScene family={svgFontFamilyLifetimeFamily} />
			</div>
		</AbsoluteFill>
	),
});
