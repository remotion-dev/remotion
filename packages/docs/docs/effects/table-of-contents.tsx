import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';
import {
	makeEffectDragData,
	setEffectDragData,
} from '../../components/effects-demos/effect-drag-data';
import {getInitialValuesFromSchema} from '../../components/effects-demos/get-default-props-from-schema';
import {effectsDemos} from '../../components/effects-demos/registry';

type Effect = {
	readonly link: string;
	readonly preview: string;
	readonly alt: string;
	readonly name: string;
	readonly description: string;
};

const categories: {
	readonly title: string;
	readonly effects: Effect[];
}[] = [
	{
		title: 'Color',
		effects: [
			{
				link: '/docs/effects/brightness',
				preview: '/img/effects-brightness-preview.png',
				alt: 'brightness effect preview',
				name: 'brightness()',
				description: 'Brightness adjustment effect',
			},
			{
				link: '/docs/effects/contrast',
				preview: '/img/effects-contrast-preview.png',
				alt: 'contrast effect preview',
				name: 'contrast()',
				description: 'Contrast adjustment effect',
			},
			{
				link: '/docs/effects/color-key',
				preview: '/img/effects-color-key-preview.png',
				alt: 'color key effect preview',
				name: 'colorKey()',
				description: 'Remove a key color (greenscreen)',
			},
			{
				link: '/docs/effects/duotone',
				preview: '/img/effects-duotone-preview.png',
				alt: 'duotone effect preview',
				name: 'duotone()',
				description: 'Two-color threshold effect',
			},
			{
				link: '/docs/effects/grayscale',
				preview: '/img/effects-grayscale-preview.png',
				alt: 'grayscale effect preview',
				name: 'grayscale()',
				description: 'Black-and-white effect',
			},
			{
				link: '/docs/effects/hue',
				preview: '/img/effects-hue-preview.png',
				alt: 'hue effect preview',
				name: 'hue()',
				description: 'Hue rotation effect',
			},
			{
				link: '/docs/effects/invert',
				preview: '/img/effects-invert-preview.png',
				alt: 'invert effect preview',
				name: 'invert()',
				description: 'Negative color effect',
			},
			{
				link: '/docs/effects/saturation',
				preview: '/img/effects-saturation-preview.png',
				alt: 'saturation effect preview',
				name: 'saturation()',
				description: 'Saturation adjustment effect',
			},
			{
				link: '/docs/effects/tint',
				preview: '/img/effects-tint-preview.png',
				alt: 'tint effect preview',
				name: 'tint()',
				description: 'Color tint effect',
			},
		],
	},
	{
		title: 'Blur & Shadow',
		effects: [
			{
				link: '/docs/effects/blur',
				preview: '/img/effects-blur-preview.png',
				alt: 'blur effect preview',
				name: 'blur()',
				description: 'Gaussian blur effect',
			},
			{
				link: '/docs/effects/linear-progressive-blur',
				preview: '/img/effects-linear-progressive-blur-preview.png',
				alt: 'linear progressive blur effect preview',
				name: 'linearProgressiveBlur()',
				description: 'Gradient-controlled blur effect',
			},
			{
				link: '/docs/effects/drop-shadow',
				preview: '/img/effects-drop-shadow-preview.png',
				alt: 'drop shadow effect preview',
				name: 'dropShadow()',
				description: 'Blurred alpha shadow effect',
			},
			{
				link: '/docs/effects/glow',
				preview: '/img/effects-glow-preview.png',
				alt: 'glow effect preview',
				name: 'glow()',
				description: 'Soft halo effect',
			},
			{
				link: '/docs/effects/outline',
				preview: '/img/effects-outline-preview.png',
				alt: 'outline effect preview',
				name: 'outline()',
				description: 'Alpha edge outline effect',
			},
		],
	},
	{
		title: 'Reveal',
		effects: [
			{
				link: '/docs/effects/evolve',
				preview: '/img/effects-evolve-preview.png',
				alt: 'evolve effect preview',
				name: 'evolve()',
				description: 'Directional reveal effect',
			},
		],
	},
	{
		title: 'Transform',
		effects: [
			{
				link: '/docs/effects/mirror',
				preview: '/img/effects-mirror-preview.png',
				alt: 'mirror effect preview',
				name: 'mirror()',
				description: 'Mirror reflection effect',
			},
			{
				link: '/docs/effects/scale',
				preview: '/img/effects-scale-preview.png',
				alt: 'scale effect preview',
				name: 'scale()',
				description: 'Scale transform effect',
			},
			{
				link: '/docs/effects/uv-translate',
				preview: '/img/effects-uv-translate-preview.png',
				alt: 'UV translate effect preview',
				name: 'uvTranslate()',
				description: 'UV-based translate effect',
			},
			{
				link: '/docs/effects/xy-translate',
				preview: '/img/effects-xy-translate-preview.png',
				alt: 'XY translate effect preview',
				name: 'xyTranslate()',
				description: 'Pixel-based translate effect',
			},
		],
	},
	{
		title: 'Distort',
		effects: [
			{
				link: '/docs/effects/barrel-distortion',
				preview: '/img/effects-barrel-distortion-preview.png',
				alt: 'barrel distortion effect preview',
				name: 'barrelDistortion()',
				description: 'Barrel distortion effect',
			},
			{
				link: '/docs/effects/chromatic-aberration',
				preview: '/img/effects-chromatic-aberration-preview.png',
				alt: 'chromatic aberration effect preview',
				name: 'chromaticAberration()',
				description: 'RGB channel split effect',
			},
			{
				link: '/docs/effects/fisheye',
				preview: '/img/effects-fisheye-preview.png',
				alt: 'fisheye effect preview',
				name: 'fisheye()',
				description: 'Ultra-wide-angle lens effect',
			},
			{
				link: '/docs/effects/wave',
				preview: '/img/effects-wave-preview.png',
				alt: 'wave effect preview',
				name: 'wave()',
				description: 'Sine wave distortion',
			},
		],
	},
	{
		title: 'Stylize',
		effects: [
			{
				link: '/docs/effects/dot-grid',
				preview: '/img/effects-dot-grid-preview.png',
				alt: 'dot grid effect preview',
				name: 'dotGrid()',
				description: 'Source-color dot mask effect',
			},
			{
				link: '/docs/effects/halftone',
				preview: '/img/effects-halftone-preview.png',
				alt: 'halftone effect preview',
				name: 'halftone()',
				description: 'Source-image halftone effect',
			},
			{
				link: '/docs/effects/noise',
				preview: '/img/effects-noise-preview.png',
				alt: 'noise effect preview',
				name: 'noise()',
				description: 'Procedural grain effect',
			},
			{
				link: '/docs/effects/pixel-dissolve',
				preview: '/img/effects-pixel-dissolve-preview.png',
				alt: 'pixel dissolve effect preview',
				name: 'pixelDissolve()',
				description: 'Pixelated dissolve effect',
			},
			{
				link: '/docs/effects/scanlines',
				preview: '/img/effects-scanlines-preview.png',
				alt: 'scanlines effect preview',
				name: 'scanlines()',
				description: 'Additive horizontal scanlines',
			},
			{
				link: '/docs/effects/speckle',
				preview: '/img/effects-speckle-preview.png',
				alt: 'speckle effect preview',
				name: 'speckle()',
				description: 'Random alpha-hole effect',
			},
			{
				link: '/docs/effects/shine',
				preview: '/img/effects-shine-preview.png',
				alt: 'shine effect preview',
				name: 'shine()',
				description: 'Glossy light sweep effect',
			},
			{
				link: '/docs/effects/vignette',
				preview: '/img/effects-vignette-preview.png',
				alt: 'vignette effect preview',
				name: 'vignette()',
				description: 'Edge darkening or transparency effect',
			},
		],
	},
	{
		title: 'Generate',
		effects: [
			{
				link: '/docs/effects/halftone-linear-gradient',
				preview: '/img/effects-halftone-linear-gradient-preview.png',
				alt: 'halftone linear gradient effect preview',
				name: 'halftoneLinearGradient()',
				description: 'Procedural dot gradient effect',
			},
			{
				link: '/docs/effects/white-noise',
				preview: '/img/effects-white-noise-preview.png',
				alt: 'white noise effect preview',
				name: 'whiteNoise()',
				description: 'Random grayscale noise layer',
			},
			{
				link: '/docs/effects/lines',
				preview: '/img/effects-lines-preview.png',
				alt: 'lines effect preview',
				name: 'lines()',
				description: 'Alternating line pattern effect',
			},
			{
				link: '/docs/effects/rings',
				preview: '/img/effects-rings-preview.png',
				alt: 'rings effect preview',
				name: 'rings()',
				description: 'Concentric ring pattern effect',
			},
			{
				link: '/docs/effects/waves',
				preview: '/img/effects-waves-preview.png',
				alt: 'waves effect preview',
				name: 'waves()',
				description: 'Wavy band pattern effect',
			},
			{
				link: '/docs/effects/zigzag',
				preview: '/img/effects-zigzag-preview.png',
				alt: 'zigzag effect preview',
				name: 'zigzag()',
				description: 'Zig-zag band pattern effect',
			},
			{
				link: '/docs/light-leaks/light-leak-effect',
				preview: '/img/effects-light-leak-preview.png',
				alt: 'light leak effect preview',
				name: 'lightLeak()',
				description: 'Light leak overlay effect',
			},
			{
				link: '/docs/starburst/starburst-effect',
				preview: '/img/effects-starburst-preview.png',
				alt: 'starburst effect preview',
				name: 'starburst()',
				description: 'Starburst ray effect',
			},
		],
	},
];

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
};

const previewImage: React.CSSProperties = {
	width: 150,
	height: 100,
	objectFit: 'cover',
	borderRadius: 4,
	flexShrink: 0,
};

const getDemoIdFromLink = (link: string) => {
	if (link.startsWith('/docs/effects/')) {
		return `effects-${link.slice('/docs/effects/'.length)}`;
	}

	if (link === '/docs/light-leaks/light-leak-effect') {
		return 'effects-light-leak';
	}

	if (link === '/docs/starburst/starburst-effect') {
		return 'effects-starburst';
	}

	return null;
};

const EffectCard: React.FC<{
	readonly effect: Effect;
}> = ({effect}) => {
	const demo = effectsDemos.find((item) => item.id === getDemoIdFromLink(effect.link));
	const dragData = demo
		? makeEffectDragData({
				effectName: demo.effectName,
				effectImportPath: demo.effectImportPath,
				effectConfig: getInitialValuesFromSchema({
					schema: demo.schema,
					initialValues: demo.initialValues,
				}),
			})
		: null;

	return (
		<TOCItem
			link={effect.link}
			draggable={dragData !== null}
			onDragStart={
				dragData === null
					? undefined
					: (e) => {
							setEffectDragData({
								dataTransfer: e.dataTransfer,
								dragData,
							});
						}
			}
			title={
				dragData === null
					? undefined
					: 'Drag this effect into Remotion Studio'
			}
		>
			<div style={row}>
				<img src={effect.preview} alt={effect.alt} style={previewImage} />
				<div style={{flex: 1, marginLeft: 10}}>
					<strong>
						<code>{effect.name}</code>
					</strong>
					<div>{effect.description}</div>
				</div>
			</div>
		</TOCItem>
	);
};

export const TableOfContents: React.FC = () => {
	return (
		<div>
			{categories.map((category) => {
				return (
					<React.Fragment key={category.title}>
						<h3>{category.title}</h3>
						<Grid>
							{category.effects.map((effect) => {
								return <EffectCard key={effect.link} effect={effect} />;
							})}
						</Grid>
					</React.Fragment>
				);
			})}
		</div>
	);
};
