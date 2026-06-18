import type {EffectDragData} from '@remotion/studio-shared';

type TimelineAddEffectMenuEffect = {
	readonly id: string;
	readonly label: string;
	readonly dragData: EffectDragData;
};

const makeEffect = ({
	id,
	label,
	name,
	importPath,
	config = {},
}: {
	readonly id: string;
	readonly label: string;
	readonly name: string;
	readonly importPath: string;
	readonly config?: Record<string, unknown>;
}): TimelineAddEffectMenuEffect => {
	return {
		id,
		label,
		dragData: {
			type: 'remotion-effect',
			version: 1,
			effect: {
				name,
				importPath,
				config,
			},
		},
	};
};

export const timelineAddEffectMenuEffects: TimelineAddEffectMenuEffect[] = [
	makeEffect({
		id: 'brightness',
		label: 'Brightness',
		name: 'brightness',
		importPath: '@remotion/effects/brightness',
	}),
	makeEffect({
		id: 'contrast',
		label: 'Contrast',
		name: 'contrast',
		importPath: '@remotion/effects/contrast',
	}),
	makeEffect({
		id: 'color-key',
		label: 'Color key',
		name: 'colorKey',
		importPath: '@remotion/effects/color-key',
		config: {similarity: 0.45},
	}),
	makeEffect({
		id: 'duotone',
		label: 'Duotone',
		name: 'duotone',
		importPath: '@remotion/effects/duotone',
	}),
	makeEffect({
		id: 'evolve',
		label: 'Evolve',
		name: 'evolve',
		importPath: '@remotion/effects/evolve',
	}),
	makeEffect({
		id: 'drop-shadow',
		label: 'Drop shadow',
		name: 'dropShadow',
		importPath: '@remotion/effects/drop-shadow',
	}),
	makeEffect({
		id: 'glow',
		label: 'Glow',
		name: 'glow',
		importPath: '@remotion/effects/glow',
	}),
	makeEffect({
		id: 'grayscale',
		label: 'Grayscale',
		name: 'grayscale',
		importPath: '@remotion/effects/grayscale',
	}),
	makeEffect({
		id: 'hue',
		label: 'Hue',
		name: 'hue',
		importPath: '@remotion/effects/hue',
	}),
	makeEffect({
		id: 'invert',
		label: 'Invert',
		name: 'invert',
		importPath: '@remotion/effects/invert',
	}),
	makeEffect({
		id: 'saturation',
		label: 'Saturation',
		name: 'saturation',
		importPath: '@remotion/effects/saturation',
	}),
	makeEffect({
		id: 'tint',
		label: 'Tint',
		name: 'tint',
		importPath: '@remotion/effects/tint',
		config: {color: '#1ec8ff'},
	}),
	makeEffect({
		id: 'shine',
		label: 'Shine',
		name: 'shine',
		importPath: '@remotion/effects/shine',
	}),
	makeEffect({
		id: 'speckle',
		label: 'Speckle',
		name: 'speckle',
		importPath: '@remotion/effects/speckle',
	}),
	makeEffect({
		id: 'mirror',
		label: 'Mirror',
		name: 'mirror',
		importPath: '@remotion/effects/mirror',
	}),
	makeEffect({
		id: 'noise',
		label: 'Noise',
		name: 'noise',
		importPath: '@remotion/effects/noise',
	}),
	makeEffect({
		id: 'noise-displacement',
		label: 'Noise displacement',
		name: 'noiseDisplacement',
		importPath: '@remotion/effects/noise-displacement',
	}),
	makeEffect({
		id: 'white-noise',
		label: 'White noise',
		name: 'whiteNoise',
		importPath: '@remotion/effects/white-noise',
	}),
	makeEffect({
		id: 'scanlines',
		label: 'Scanlines',
		name: 'scanlines',
		importPath: '@remotion/effects/scanlines',
	}),
	makeEffect({
		id: 'lines',
		label: 'Lines',
		name: 'lines',
		importPath: '@remotion/effects/lines',
	}),
	makeEffect({
		id: 'rings',
		label: 'Rings',
		name: 'rings',
		importPath: '@remotion/effects/rings',
	}),
	makeEffect({
		id: 'scale',
		label: 'Scale',
		name: 'scale',
		importPath: '@remotion/effects/scale',
	}),
	makeEffect({
		id: 'xy-translate',
		label: 'XY translate',
		name: 'xyTranslate',
		importPath: '@remotion/effects/translate',
	}),
	makeEffect({
		id: 'uv-translate',
		label: 'UV translate',
		name: 'uvTranslate',
		importPath: '@remotion/effects/translate',
	}),
	makeEffect({
		id: 'barrel-distortion',
		label: 'Barrel distortion',
		name: 'barrelDistortion',
		importPath: '@remotion/effects/barrel-distortion',
	}),
	makeEffect({
		id: 'fisheye',
		label: 'Fisheye',
		name: 'fisheye',
		importPath: '@remotion/effects/fisheye',
	}),
	makeEffect({
		id: 'vignette',
		label: 'Vignette',
		name: 'vignette',
		importPath: '@remotion/effects/vignette',
	}),
	makeEffect({
		id: 'blur',
		label: 'Blur',
		name: 'blur',
		importPath: '@remotion/effects/blur',
		config: {radius: 40},
	}),
	makeEffect({
		id: 'linear-progressive-blur',
		label: 'Linear progressive blur',
		name: 'linearProgressiveBlur',
		importPath: '@remotion/effects/linear-progressive-blur',
	}),
	makeEffect({
		id: 'chromatic-aberration',
		label: 'Chromatic aberration',
		name: 'chromaticAberration',
		importPath: '@remotion/effects/chromatic-aberration',
	}),
	makeEffect({
		id: 'wave',
		label: 'Wave',
		name: 'wave',
		importPath: '@remotion/effects/wave',
	}),
	makeEffect({
		id: 'waves',
		label: 'Waves',
		name: 'waves',
		importPath: '@remotion/effects/waves',
	}),
	makeEffect({
		id: 'zigzag',
		label: 'Zigzag',
		name: 'zigzag',
		importPath: '@remotion/effects/zigzag',
	}),
	makeEffect({
		id: 'halftone',
		label: 'Halftone',
		name: 'halftone',
		importPath: '@remotion/effects/halftone',
	}),
	makeEffect({
		id: 'pixel-dissolve',
		label: 'Pixel dissolve',
		name: 'pixelDissolve',
		importPath: '@remotion/effects/pixel-dissolve',
	}),
	makeEffect({
		id: 'halftone-linear-gradient',
		label: 'Halftone linear gradient',
		name: 'halftoneLinearGradient',
		importPath: '@remotion/effects/halftone-linear-gradient',
	}),
	makeEffect({
		id: 'dot-grid',
		label: 'Dot grid',
		name: 'dotGrid',
		importPath: '@remotion/effects/dot-grid',
	}),
	makeEffect({
		id: 'starburst',
		label: 'Starburst',
		name: 'starburst',
		importPath: '@remotion/starburst',
		config: {
			rays: 16,
			colors: ['#ff6600', '#ffff00'],
		},
	}),
	makeEffect({
		id: 'light-leak',
		label: 'Light leak',
		name: 'lightLeak',
		importPath: '@remotion/light-leaks',
	}),
];
