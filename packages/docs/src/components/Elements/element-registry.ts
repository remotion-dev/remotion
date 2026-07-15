import type {ComponentType} from 'react';
import {PaperTexture} from '../../../elements/backgrounds/paper-texture/paper-texture';
import {RotatingStarburst} from '../../../elements/backgrounds/rotating-starburst/rotating-starburst';
import {NumberCounter} from '../../../elements/data/number-counter/number-counter';
import {LowerThird} from '../../../elements/overlays/lower-third/lower-third';
import type {Contributor} from '../Credits';

export type ElementDefinition = {
	readonly category: string;
	readonly component: ComponentType<Record<string, never>>;
	readonly contributors: readonly Contributor[];
	readonly description: string;
	readonly displayName: string;
	readonly durationInFrames: number;
	readonly elementHeight: number | null;
	readonly elementWidth: number | null;
	readonly fps: number;
	readonly height: number;
	readonly posterFrame: number;
	readonly previewPadding: number;
	readonly slug: string;
	readonly width: number;
};

export const paperTextureDefinition: ElementDefinition = {
	category: 'backgrounds',
	component: PaperTexture,
	contributors: [],
	description:
		'A white paper texture background with a slowly changing posterized seed.',
	displayName: 'Paper Texture',
	durationInFrames: 120,
	elementHeight: null,
	elementWidth: null,
	fps: 30,
	height: 1080,
	posterFrame: 60,
	previewPadding: 0,
	slug: 'backgrounds/paper-texture',
	width: 1920,
};

export const rotatingStarburstDefinition: ElementDefinition = {
	category: 'backgrounds',
	component: RotatingStarburst,
	contributors: [],
	description: 'A solid background with a slowly rotating starburst effect.',
	displayName: 'Rotating Starburst',
	durationInFrames: 240,
	elementHeight: null,
	elementWidth: null,
	fps: 30,
	height: 1080,
	posterFrame: 120,
	previewPadding: 0,
	slug: 'backgrounds/rotating-starburst',
	width: 1920,
};

export const lowerThirdDefinition: ElementDefinition = {
	category: 'overlays',
	component: LowerThird,
	contributors: [],
	description:
		'A clean animated lower third for introducing a speaker, guest, or section.',
	displayName: 'Lower Third',
	durationInFrames: 120,
	elementHeight: 138,
	elementWidth: 680,
	fps: 30,
	height: 1080,
	posterFrame: 60,
	previewPadding: 300,
	slug: 'overlays/lower-third',
	width: 1920,
};

export const numberCounterDefinition: ElementDefinition = {
	category: 'data',
	component: NumberCounter,
	contributors: [
		{
			username: 'KapishDima',
			contribution: 'Author',
		},
	],
	description:
		'A simple animated counter that smoothly counts from a start value to an end value.',
	displayName: 'Number Counter',
	durationInFrames: 120,
	elementHeight: 200,
	elementWidth: 640,
	fps: 30,
	height: 1080,
	posterFrame: 60,
	previewPadding: 120,
	slug: 'data/number-counter',
	width: 1920,
};

export const elementDefinitions: readonly ElementDefinition[] = [
	paperTextureDefinition,
	rotatingStarburstDefinition,
	lowerThirdDefinition,
	numberCounterDefinition,
];

export const getElementCompositionId = (slug: string) => {
	return `element-${slug.replaceAll('/', '-')}`;
};

export const getElementPreviewUrls = (slug: string) => {
	const base = `https://remotion.media/elements/${slug}`;

	return {
		mp4: `${base}/preview.mp4`,
		png: `${base}/preview.png`,
	};
};

export const getElementDefinition = (slug: string) => {
	const definition = elementDefinitions.find((entry) => entry.slug === slug);

	if (!definition) {
		throw new Error(`No Element definition found for ${slug}`);
	}

	return definition;
};
