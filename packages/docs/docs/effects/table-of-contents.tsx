import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

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
				preview: '/img/effects-brightness-preview.jpg',
				alt: 'brightness effect preview',
				name: 'brightness()',
				description: 'Brightness adjustment effect',
			},
			{
				link: '/docs/effects/contrast',
				preview: '/img/effects-contrast-preview.jpg',
				alt: 'contrast effect preview',
				name: 'contrast()',
				description: 'Contrast adjustment effect',
			},
			{
				link: '/docs/effects/duotone',
				preview: '/img/effects-duotone-preview.jpg',
				alt: 'duotone effect preview',
				name: 'duotone()',
				description: 'Two-color threshold effect',
			},
			{
				link: '/docs/effects/glow',
				preview: '/img/effects-glow-preview.jpg',
				alt: 'glow effect preview',
				name: 'glow()',
				description: 'Soft halo effect',
			},
			{
				link: '/docs/effects/grayscale',
				preview: '/img/effects-grayscale-preview.jpg',
				alt: 'grayscale effect preview',
				name: 'grayscale()',
				description: 'Black-and-white effect',
			},
			{
				link: '/docs/effects/hue',
				preview: '/img/effects-hue-preview.jpg',
				alt: 'hue effect preview',
				name: 'hue()',
				description: 'Hue rotation effect',
			},
			{
				link: '/docs/effects/invert',
				preview: '/img/effects-invert-preview.jpg',
				alt: 'invert effect preview',
				name: 'invert()',
				description: 'Negative color effect',
			},
			{
				link: '/docs/effects/saturation',
				preview: '/img/effects-saturation-preview.jpg',
				alt: 'saturation effect preview',
				name: 'saturation()',
				description: 'Saturation adjustment effect',
			},
			{
				link: '/docs/effects/tint',
				preview: '/img/effects-tint-preview.jpg',
				alt: 'tint effect preview',
				name: 'tint()',
				description: 'Color tint effect',
			},
		],
	},
	{
		title: 'Transform',
		effects: [
			{
				link: '/docs/effects/mirror',
				preview: '/img/effects-mirror-preview.jpg',
				alt: 'mirror effect preview',
				name: 'mirror()',
				description: 'Mirror reflection effect',
			},
			{
				link: '/docs/effects/scale',
				preview: '/img/effects-scale-preview.jpg',
				alt: 'scale effect preview',
				name: 'scale()',
				description: 'Scale transform effect',
			},
			{
				link: '/docs/effects/xy-translate',
				preview: '/img/effects-xy-translate-preview.jpg',
				alt: 'XY translate effect preview',
				name: 'xyTranslate()',
				description: 'Pixel-based translate effect',
			},
			{
				link: '/docs/effects/uv-translate',
				preview: '/img/effects-uv-translate-preview.jpg',
				alt: 'UV translate effect preview',
				name: 'uvTranslate()',
				description: 'UV-based translate effect',
			},
		],
	},
	{
		title: 'Distort',
		effects: [
			{
				link: '/docs/effects/barrel-distortion',
				preview: '/img/effects-barrel-distortion-preview.jpg',
				alt: 'barrel distortion effect preview',
				name: 'barrelDistortion()',
				description: 'Barrel distortion effect',
			},
			{
				link: '/docs/effects/chromatic-aberration',
				preview: '/img/effects-chromatic-aberration-preview.jpg',
				alt: 'chromatic aberration effect preview',
				name: 'chromaticAberration()',
				description: 'RGB channel split effect',
			},
			{
				link: '/docs/effects/blur',
				preview: '/img/effects-blur-preview.jpg',
				alt: 'blur effect preview',
				name: 'blur()',
				description: 'Gaussian blur effect',
			},
			{
				link: '/docs/effects/wave',
				preview: '/img/effects-wave-preview.jpg',
				alt: 'wave effect preview',
				name: 'wave()',
				description: 'Sine wave distortion',
			},
		],
	},
	{
		title: 'Generative',
		effects: [
			{
				link: '/docs/effects/halftone',
				preview: '/img/effects-halftone-preview.png',
				alt: 'halftone effect preview',
				name: 'halftone()',
				description: 'Halftone dot grid effect',
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

const EffectCard: React.FC<{
	readonly effect: Effect;
}> = ({effect}) => {
	return (
		<TOCItem link={effect.link}>
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
