import {createMaskImageLayersFixture} from './mask-image-layers';
import {rasterMask} from './mask-image-url-sizing';

const url = `url("${rasterMask}")`;
const a = 'linear-gradient(90deg, black, transparent)';
const b = 'linear-gradient(180deg, rgba(0, 0, 0, 0.5), transparent)';
const hardA = 'linear-gradient(90deg, black 50%, transparent 50%)';
const hardB = 'linear-gradient(180deg, black 50%, transparent 50%)';
const half = 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))';
const operators = ['add', 'subtract', 'intersect', 'exclude'] as const;
const styles: React.CSSProperties[] = [
	...operators.map((maskComposite) => ({
		maskImage: `${a}, ${url}`,
		maskComposite,
	})),
	...operators.map((maskComposite) => ({
		maskImage: `${a}, ${b}`,
		maskComposite,
	})),
	{maskImage: `${a}, ${b}, ${a}`, maskComposite: 'subtract, add'},
	{maskImage: `${b}, ${a}, ${b}`, maskComposite: 'exclude, intersect'},
	{maskImage: `none, ${a}`, maskComposite: 'add'},
	{maskImage: `${a}, none`, maskComposite: 'subtract'},
	{maskImage: `none, ${a}`, maskComposite: 'intersect'},
	{
		maskImage: `${a}, ${b}, ${a}`,
		maskPosition: '0px 0px, 4px 2px',
		maskSize: '16px 8px, 24px 8px',
		maskComposite: 'exclude',
	},
	{maskImage: `${a}, ${b}`, maskComposite: 'add, intersect'},
	{maskImage: url},
	...operators.map((maskComposite) => ({
		maskImage: `${hardA}, ${hardB}`,
		maskComposite,
	})),
	...operators.map((maskComposite) => ({
		maskImage: `${half}, ${half}`,
		maskComposite,
	})),
];
const variant = {id: 'mask-gradient-layers', styles};
export const maskGradientLayers = createMaskImageLayersFixture(
	'data',
	true,
	variant,
);
export const maskGradientLayersTransparent = createMaskImageLayersFixture(
	'data',
	false,
	variant,
);
export const maskGradientLayersUrl = createMaskImageLayersFixture(
	'url',
	true,
	variant,
);
export const maskGradientLayersUrlTransparent = createMaskImageLayersFixture(
	'url',
	false,
	variant,
);
export const maskGradientLayersBlob = createMaskImageLayersFixture(
	'blob',
	true,
	variant,
);
export const maskGradientLayersBlobTransparent = createMaskImageLayersFixture(
	'blob',
	false,
	variant,
);

const palette = [
	'#ff0000',
	'#0000ff',
	'#4e9a06',
	'#123456',
	'#07d9f7',
	'#fdfcfb',
	'#010203',
	'#d04060',
];
const paletteVariant = {
	id: 'mask-gradient-palette',
	styles: styles.map((style, index) => ({
		...style,
		backgroundColor: palette[index % palette.length],
	})),
};
export const maskGradientPalette = createMaskImageLayersFixture(
	'data',
	true,
	paletteVariant,
);
export const maskGradientPaletteTransparent = createMaskImageLayersFixture(
	'data',
	false,
	paletteVariant,
);
