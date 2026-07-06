import type {EffectDragData} from './effect-drag-data';

export type EffectCatalogItem = {
	readonly id: string;
	readonly category: string;
	readonly label: string;
	readonly description: string;
	readonly effect: EffectDragData['effect'];
};

export type EffectCatalogCategory = {
	readonly title: string;
	readonly effects: readonly EffectCatalogItem[];
};

export const getEffectDocumentationPath = (item: EffectCatalogItem) => {
	if (item.id === 'effects-light-leak') {
		return '/docs/light-leaks/light-leak-effect';
	}

	if (item.id === 'effects-starburst') {
		return '/docs/starburst/starburst-effect';
	}

	return `/docs/effects/${item.id.slice('effects-'.length)}`;
};

export const getEffectDocumentationLink = (item: EffectCatalogItem) => {
	return `https://www.remotion.dev${getEffectDocumentationPath(item)}`;
};

export const getEffectPreviewSource = (item: EffectCatalogItem) => {
	return `/img/${item.id}-preview.png`;
};

export const getEffectPreviewAlt = (item: EffectCatalogItem) => {
	const effectName = item.id
		.slice('effects-'.length)
		.replaceAll('-', ' ')
		.replace(/^uv /, 'UV ')
		.replace(/^xy /, 'XY ')
		.replace(/^tv /, 'TV ');

	return `${effectName} effect preview`;
};

export const makeEffectDragDataFromCatalogItem = (
	item: EffectCatalogItem,
): EffectDragData => {
	return {
		type: 'remotion-effect',
		version: 1,
		effect: item.effect,
	};
};

export const getEffectCatalogCategories = (
	items: readonly EffectCatalogItem[],
): readonly EffectCatalogCategory[] => {
	const categories: EffectCatalogCategory[] = [];

	for (const item of items) {
		const last = categories[categories.length - 1];
		if (last?.title === item.category) {
			categories[categories.length - 1] = {
				...last,
				effects: [...last.effects, item],
			};
			continue;
		}

		categories.push({
			title: item.category,
			effects: [item],
		});
	}

	return categories;
};

export const EFFECT_CATALOG: readonly EffectCatalogItem[] = [
	{
		id: 'effects-brightness',
		category: 'Color',
		label: 'brightness()',
		description: 'Brightness adjustment effect',
		effect: {
			name: 'brightness',
			importPath: '@remotion/effects/brightness',
			config: {},
		},
	},
	{
		id: 'effects-contrast',
		category: 'Color',
		label: 'contrast()',
		description: 'Contrast adjustment effect',
		effect: {
			name: 'contrast',
			importPath: '@remotion/effects/contrast',
			config: {},
		},
	},
	{
		id: 'effects-color-key',
		category: 'Color',
		label: 'colorKey()',
		description: 'Remove a key color (greenscreen)',
		effect: {
			name: 'colorKey',
			importPath: '@remotion/effects/color-key',
			config: {
				similarity: 0.45,
			},
		},
	},
	{
		id: 'effects-duotone',
		category: 'Color',
		label: 'duotone()',
		description: 'Two-color threshold effect',
		effect: {
			name: 'duotone',
			importPath: '@remotion/effects/duotone',
			config: {},
		},
	},
	{
		id: 'effects-grayscale',
		category: 'Color',
		label: 'grayscale()',
		description: 'Black-and-white effect',
		effect: {
			name: 'grayscale',
			importPath: '@remotion/effects/grayscale',
			config: {},
		},
	},
	{
		id: 'effects-hue',
		category: 'Color',
		label: 'hue()',
		description: 'Hue rotation effect',
		effect: {
			name: 'hue',
			importPath: '@remotion/effects/hue',
			config: {},
		},
	},
	{
		id: 'effects-invert',
		category: 'Color',
		label: 'invert()',
		description: 'Negative color effect',
		effect: {
			name: 'invert',
			importPath: '@remotion/effects/invert',
			config: {},
		},
	},
	{
		id: 'effects-saturation',
		category: 'Color',
		label: 'saturation()',
		description: 'Saturation adjustment effect',
		effect: {
			name: 'saturation',
			importPath: '@remotion/effects/saturation',
			config: {},
		},
	},
	{
		id: 'effects-tint',
		category: 'Color',
		label: 'tint()',
		description: 'Color tint effect',
		effect: {
			name: 'tint',
			importPath: '@remotion/effects/tint',
			config: {
				color: '#1ec8ff',
			},
		},
	},
	{
		id: 'effects-linear-gradient',
		category: 'Color',
		label: 'linearGradient()',
		description: 'Two-stop gradient effect',
		effect: {
			name: 'linearGradient',
			importPath: '@remotion/effects/linear-gradient',
			config: {},
		},
	},
	{
		id: 'effects-linear-gradient-tint',
		category: 'Color',
		label: 'linearGradientTint()',
		description: 'Gradient tint effect',
		effect: {
			name: 'linearGradientTint',
			importPath: '@remotion/effects/linear-gradient-tint',
			config: {},
		},
	},
	{
		id: 'effects-thermal-vision',
		category: 'Color',
		label: 'thermalVision()',
		description: 'Thermal heat-map color effect',
		effect: {
			name: 'thermalVision',
			importPath: '@remotion/effects/thermal-vision',
			config: {},
		},
	},
	{
		id: 'effects-blur',
		category: 'Blur & Shadow',
		label: 'blur()',
		description: 'Gaussian blur effect',
		effect: {
			name: 'blur',
			importPath: '@remotion/effects/blur',
			config: {
				radius: 40,
			},
		},
	},
	{
		id: 'effects-linear-progressive-blur',
		category: 'Blur & Shadow',
		label: 'linearProgressiveBlur()',
		description: 'Gradient-controlled blur effect',
		effect: {
			name: 'linearProgressiveBlur',
			importPath: '@remotion/effects/linear-progressive-blur',
			config: {},
		},
	},
	{
		id: 'effects-radial-progressive-blur',
		category: 'Blur & Shadow',
		label: 'radialProgressiveBlur()',
		description: 'Ellipse-controlled blur effect',
		effect: {
			name: 'radialProgressiveBlur',
			importPath: '@remotion/effects/radial-progressive-blur',
			config: {},
		},
	},
	{
		id: 'effects-zoom-blur',
		category: 'Blur & Shadow',
		label: 'zoomBlur()',
		description: 'Radial zoom blur effect',
		effect: {
			name: 'zoomBlur',
			importPath: '@remotion/effects/zoom-blur',
			config: {},
		},
	},
	{
		id: 'effects-drop-shadow',
		category: 'Blur & Shadow',
		label: 'dropShadow()',
		description: 'Blurred alpha shadow effect',
		effect: {
			name: 'dropShadow',
			importPath: '@remotion/effects/drop-shadow',
			config: {},
		},
	},
	{
		id: 'effects-glow',
		category: 'Blur & Shadow',
		label: 'glow()',
		description: 'Soft halo effect',
		effect: {
			name: 'glow',
			importPath: '@remotion/effects/glow',
			config: {},
		},
	},
	{
		id: 'effects-light-trail',
		category: 'Blur & Shadow',
		label: 'lightTrail()',
		description: 'Directional light trail effect',
		effect: {
			name: 'lightTrail',
			importPath: '@remotion/effects/light-trail',
			config: {},
		},
	},
	{
		id: 'effects-evolve',
		category: 'Reveal',
		label: 'evolve()',
		description: 'Directional reveal effect',
		effect: {
			name: 'evolve',
			importPath: '@remotion/effects/evolve',
			config: {},
		},
	},
	{
		id: 'effects-venetian-blinds',
		category: 'Reveal',
		label: 'venetianBlinds()',
		description: 'Slatted reveal effect',
		effect: {
			name: 'venetianBlinds',
			importPath: '@remotion/effects/venetian-blinds',
			config: {},
		},
	},
	{
		id: 'effects-mirror',
		category: 'Transform',
		label: 'mirror()',
		description: 'Mirror reflection effect',
		effect: {
			name: 'mirror',
			importPath: '@remotion/effects/mirror',
			config: {},
		},
	},
	{
		id: 'effects-scale',
		category: 'Transform',
		label: 'scale()',
		description: 'Scale transform effect',
		effect: {
			name: 'scale',
			importPath: '@remotion/effects/scale',
			config: {
				scale: 1,
			},
		},
	},
	{
		id: 'effects-uv-translate',
		category: 'Transform',
		label: 'uvTranslate()',
		description: 'UV-based translate effect',
		effect: {
			name: 'uvTranslate',
			importPath: '@remotion/effects/translate',
			config: {},
		},
	},
	{
		id: 'effects-xy-translate',
		category: 'Transform',
		label: 'xyTranslate()',
		description: 'Pixel-based translate effect',
		effect: {
			name: 'xyTranslate',
			importPath: '@remotion/effects/translate',
			config: {},
		},
	},
	{
		id: 'effects-barrel-distortion',
		category: 'Distort',
		label: 'barrelDistortion()',
		description: 'Barrel distortion effect',
		effect: {
			name: 'barrelDistortion',
			importPath: '@remotion/effects/barrel-distortion',
			config: {},
		},
	},
	{
		id: 'effects-chromatic-aberration',
		category: 'Distort',
		label: 'chromaticAberration()',
		description: 'RGB channel split effect',
		effect: {
			name: 'chromaticAberration',
			importPath: '@remotion/effects/chromatic-aberration',
			config: {},
		},
	},
	{
		id: 'effects-fisheye',
		category: 'Distort',
		label: 'fisheye()',
		description: 'Ultra-wide-angle lens effect',
		effect: {
			name: 'fisheye',
			importPath: '@remotion/effects/fisheye',
			config: {},
		},
	},
	{
		id: 'effects-corner-pin',
		category: 'Distort',
		label: 'cornerPin()',
		description: 'Pin source corners to a quad',
		effect: {
			name: 'cornerPin',
			importPath: '@remotion/effects/corner-pin',
			config: {
				topLeft: [0.08, 0.12],
				topRight: [0.92, 0.04],
				bottomRight: [0.86, 0.9],
				bottomLeft: [0.14, 0.96],
			},
		},
	},
	{
		id: 'effects-wave',
		category: 'Distort',
		label: 'wave()',
		description: 'Sine wave distortion',
		effect: {
			name: 'wave',
			importPath: '@remotion/effects/wave',
			config: {},
		},
	},
	{
		id: 'effects-burlap',
		category: 'Stylize',
		label: 'burlap()',
		description: 'Procedural woven texture effect',
		effect: {
			name: 'burlap',
			importPath: '@remotion/effects/burlap',
			config: {},
		},
	},
	{
		id: 'effects-emboss',
		category: 'Stylize',
		label: 'emboss()',
		description: 'Procedural raised-line relief',
		effect: {
			name: 'emboss',
			importPath: '@remotion/effects/emboss',
			config: {},
		},
	},
	{
		id: 'effects-dot-grid',
		category: 'Stylize',
		label: 'dotGrid()',
		description: 'Source-color dot mask effect',
		effect: {
			name: 'dotGrid',
			importPath: '@remotion/effects/dot-grid',
			config: {},
		},
	},
	{
		id: 'effects-halftone',
		category: 'Stylize',
		label: 'halftone()',
		description: 'Source-image halftone effect',
		effect: {
			name: 'halftone',
			importPath: '@remotion/effects/halftone',
			config: {},
		},
	},
	{
		id: 'effects-noise',
		category: 'Stylize',
		label: 'noise()',
		description: 'Procedural grain effect',
		effect: {
			name: 'noise',
			importPath: '@remotion/effects/noise',
			config: {},
		},
	},
	{
		id: 'effects-noise-displacement',
		category: 'Stylize',
		label: 'noiseDisplacement()',
		description: 'Localized noisy displacement',
		effect: {
			name: 'noiseDisplacement',
			importPath: '@remotion/effects/noise-displacement',
			config: {
				center: [0.6124309308853857, 0.5010527449123625],
				radius: 0.41,
				strength: 15.5,
				seed: 78,
				grainSize: 0.9,
				passes: 12,
				blur: 0,
				feather: 1,
				biasDirection: 313,
				biasAmount: 1,
			},
		},
	},
	{
		id: 'effects-paper',
		category: 'Stylize',
		label: 'paper()',
		description: 'Procedural paper texture effect',
		effect: {
			name: 'paper',
			importPath: '@remotion/effects/paper',
			config: {},
		},
	},
	{
		id: 'effects-pattern',
		category: 'Stylize',
		label: 'pattern()',
		description: 'Repeated source tile effect',
		effect: {
			name: 'pattern',
			importPath: '@remotion/effects/pattern',
			config: {},
		},
	},
	{
		id: 'effects-pixel-dissolve',
		category: 'Stylize',
		label: 'pixelDissolve()',
		description: 'Pixelated dissolve effect',
		effect: {
			name: 'pixelDissolve',
			importPath: '@remotion/effects/pixel-dissolve',
			config: {},
		},
	},
	{
		id: 'effects-pixelate',
		category: 'Stylize',
		label: 'pixelate()',
		description: 'Pixelation effect',
		effect: {
			name: 'pixelate',
			importPath: '@remotion/effects/pixelate',
			config: {
				blockSize: 20,
			},
		},
	},
	{
		id: 'effects-scanlines',
		category: 'Stylize',
		label: 'scanlines()',
		description: 'Additive horizontal scanlines',
		effect: {
			name: 'scanlines',
			importPath: '@remotion/effects/scanlines',
			config: {},
		},
	},
	{
		id: 'effects-speckle',
		category: 'Stylize',
		label: 'speckle()',
		description: 'Random alpha-hole effect',
		effect: {
			name: 'speckle',
			importPath: '@remotion/effects/speckle',
			config: {},
		},
	},
	{
		id: 'effects-shine',
		category: 'Stylize',
		label: 'shine()',
		description: 'Glossy light sweep effect',
		effect: {
			name: 'shine',
			importPath: '@remotion/effects/shine',
			config: {},
		},
	},
	{
		id: 'effects-shrinkwrap',
		category: 'Stylize',
		label: 'shrinkwrap()',
		description: 'Procedural plastic wrap effect',
		effect: {
			name: 'shrinkwrap',
			importPath: '@remotion/effects/shrinkwrap',
			config: {
				amount: 0.94,
				displacement: 13.5,
				highlightIntensity: 1.54,
				wrinkleDensity: 0.87,
				edgeTension: 0.58,
				phase: 0,
				seed: 12,
			},
		},
	},
	{
		id: 'effects-vignette',
		category: 'Stylize',
		label: 'vignette()',
		description: 'Edge darkening or transparency effect',
		effect: {
			name: 'vignette',
			importPath: '@remotion/effects/vignette',
			config: {},
		},
	},
	{
		id: 'effects-contour-lines',
		category: 'Generate',
		label: 'contourLines()',
		description: 'Topographic line overlay effect',
		effect: {
			name: 'contourLines',
			importPath: '@remotion/effects/contour-lines',
			config: {},
		},
	},
	{
		id: 'effects-checkerboard',
		category: 'Generate',
		label: 'checkerboard()',
		description: 'Checkerboard pattern effect',
		effect: {
			name: 'checkerboard',
			importPath: '@remotion/effects/checkerboard',
			config: {},
		},
	},
	{
		id: 'effects-halftone-linear-gradient',
		category: 'Generate',
		label: 'halftoneLinearGradient()',
		description: 'Procedural dot gradient effect',
		effect: {
			name: 'halftoneLinearGradient',
			importPath: '@remotion/effects/halftone-linear-gradient',
			config: {},
		},
	},
	{
		id: 'effects-gridlines',
		category: 'Generate',
		label: 'gridlines()',
		description: 'Procedural grid pattern effect',
		effect: {
			name: 'gridlines',
			importPath: '@remotion/effects/gridlines',
			config: {},
		},
	},
	{
		id: 'effects-white-noise',
		category: 'Generate',
		label: 'whiteNoise()',
		description: 'Random grayscale noise layer',
		effect: {
			name: 'whiteNoise',
			importPath: '@remotion/effects/white-noise',
			config: {},
		},
	},
	{
		id: 'effects-tv-signal-off',
		category: 'Generate',
		label: 'tvSignalOff()',
		description: 'TV color bars test pattern',
		effect: {
			name: 'tvSignalOff',
			importPath: '@remotion/effects/tv-signal-off',
			config: {},
		},
	},
	{
		id: 'effects-lines',
		category: 'Generate',
		label: 'lines()',
		description: 'Alternating line pattern effect',
		effect: {
			name: 'lines',
			importPath: '@remotion/effects/lines',
			config: {},
		},
	},
	{
		id: 'effects-rings',
		category: 'Generate',
		label: 'rings()',
		description: 'Concentric ring pattern effect',
		effect: {
			name: 'rings',
			importPath: '@remotion/effects/rings',
			config: {},
		},
	},
	{
		id: 'effects-waves',
		category: 'Generate',
		label: 'waves()',
		description: 'Wavy band pattern effect',
		effect: {
			name: 'waves',
			importPath: '@remotion/effects/waves',
			config: {},
		},
	},
	{
		id: 'effects-zigzag',
		category: 'Generate',
		label: 'zigzag()',
		description: 'Zig-zag band pattern effect',
		effect: {
			name: 'zigzag',
			importPath: '@remotion/effects/zigzag',
			config: {},
		},
	},
	{
		id: 'effects-light-leak',
		category: 'Generate',
		label: 'lightLeak()',
		description: 'Light leak overlay effect',
		effect: {
			name: 'lightLeak',
			importPath: '@remotion/light-leaks',
			config: {},
		},
	},
	{
		id: 'effects-starburst',
		category: 'Generate',
		label: 'starburst()',
		description: 'Starburst ray effect',
		effect: {
			name: 'starburst',
			importPath: '@remotion/starburst',
			config: {
				rays: 16,
				colors: ['#ff6600', '#ffff00'],
			},
		},
	},
];
