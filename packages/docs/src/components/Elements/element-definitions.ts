import type {
	ElementDependency,
	ElementInstallationMode,
} from '@remotion/studio-protocol';
import type {ComponentType} from 'react';
import {LiquidContours} from '../../../elements/backgrounds/liquid-contours/liquid-contours';
import {NotebookPaper} from '../../../elements/backgrounds/notebook-paper/notebook-paper';
import {PaperTexture} from '../../../elements/backgrounds/paper-texture/paper-texture';
import {RotatingStarburst} from '../../../elements/backgrounds/rotating-starburst/rotating-starburst';
import {MovingPillCaptions} from '../../../elements/captions/moving-pill-captions/moving-pill-captions';
import {PoppingWordCaptions} from '../../../elements/captions/popping-word-captions/popping-word-captions';
import {WordHighlightCaptions} from '../../../elements/captions/word-highlight-captions/word-highlight-captions';
import {HorizontalBarChart} from '../../../elements/data/horizontal-bar-chart/horizontal-bar-chart';
import {NumberCounter} from '../../../elements/data/number-counter/number-counter';
import {ProductOffer} from '../../../elements/data/product-offer/product-offer';
import {LocationLowerThird} from '../../../elements/overlays/location-lower-third/location-lower-third';
import {NameLowerThird} from '../../../elements/overlays/lower-third/lower-third';
import {CircleMarker} from '../../../elements/text/circle-marker/circle-marker';
import {CrossedOffText} from '../../../elements/text/crossed-off/crossed-off';
import {NewsArticleHeadlineHighlight} from '../../../elements/text/news-article-headline-highlight/news-article-headline-highlight';
import {StrikeThroughText} from '../../../elements/text/strike-through/strike-through';
import {TextMarker} from '../../../elements/text/text-marker/text-marker';
import type {Contributor} from '../Credits';

export type ElementPreviewMetadata = {
	readonly posterUrl: `https://remotion.media/elements/${string}-preview.png`;
	readonly videoUrl: `https://remotion.media/elements/${string}-preview.mp4`;
};

export type ElementDefinition = {
	readonly category: string;
	readonly component: ComponentType<Record<string, never>>;
	readonly contributors: readonly Contributor[];
	readonly dependencies: readonly ElementDependency[];
	readonly description: string;
	readonly displayName: string;
	readonly durationInFrames: number;
	readonly elementHeight: number | null;
	readonly elementWidth: number | null;
	readonly fps: number;
	readonly height: number;
	readonly posterFrame: number;
	readonly preview: ElementPreviewMetadata;
	readonly previewPadding: number;
	readonly slug: string;
	readonly installationMode: ElementInstallationMode;
	readonly width: number;
};

export const elementDefinitions = {
	'backgrounds/liquid-contours': {
		category: 'backgrounds',
		component: LiquidContours,
		contributors: [],
		description:
			'A flowing two-color background made from animated liquid contour bands.',
		dependencies: [{name: '@remotion/effects', version: null}],
		displayName: 'Liquid Contours',
		durationInFrames: 240,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 120,
		preview: {
			posterUrl:
				'https://remotion.media/elements/backgrounds-liquid-contours-preview.png',
			videoUrl:
				'https://remotion.media/elements/backgrounds-liquid-contours-preview.mp4',
		},
		previewPadding: 0,
		slug: 'backgrounds/liquid-contours',
		installationMode: 'wrapped',
		width: 1920,
	},
	'backgrounds/notebook-paper': {
		category: 'backgrounds',
		component: NotebookPaper,
		contributors: [],
		description: 'A white paper background with subtle blue gridlines.',
		dependencies: [{name: '@remotion/effects', version: null}],
		displayName: 'Notebook Paper',
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 0,
		preview: {
			posterUrl:
				'https://remotion.media/elements/backgrounds-notebook-paper-preview.png',
			videoUrl:
				'https://remotion.media/elements/backgrounds-notebook-paper-preview.mp4',
		},
		previewPadding: 0,
		slug: 'backgrounds/notebook-paper',
		installationMode: 'wrapped',
		width: 1920,
	},
	'backgrounds/paper-texture': {
		category: 'backgrounds',
		component: PaperTexture,
		contributors: [],
		description:
			'A white paper texture background with a slowly changing posterized seed.',
		dependencies: [{name: '@remotion/effects', version: null}],
		displayName: 'Paper Texture',
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			posterUrl:
				'https://remotion.media/elements/backgrounds-paper-texture-preview.png',
			videoUrl:
				'https://remotion.media/elements/backgrounds-paper-texture-preview.mp4',
		},
		previewPadding: 0,
		slug: 'backgrounds/paper-texture',
		installationMode: 'wrapped',
		width: 1920,
	},
	'backgrounds/rotating-starburst': {
		category: 'backgrounds',
		component: RotatingStarburst,
		contributors: [],
		description: 'A solid background with a slowly rotating starburst effect.',
		dependencies: [{name: '@remotion/effects', version: null}],
		displayName: 'Rotating Starburst',
		durationInFrames: 240,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 120,
		preview: {
			posterUrl:
				'https://remotion.media/elements/backgrounds-rotating-starburst-preview.png',
			videoUrl:
				'https://remotion.media/elements/backgrounds-rotating-starburst-preview.mp4',
		},
		previewPadding: 0,
		slug: 'backgrounds/rotating-starburst',
		installationMode: 'wrapped',
		width: 1920,
	},
	'overlays/location-lower-third': {
		category: 'overlays',
		component: LocationLowerThird,
		contributors: [],
		description: 'An animated lower third for an event location and venue.',
		dependencies: [],
		displayName: 'Location Lower Third',
		durationInFrames: 120,
		elementHeight: 138,
		elementWidth: 680,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			posterUrl:
				'https://remotion.media/elements/overlays-location-lower-third-preview.png',
			videoUrl:
				'https://remotion.media/elements/overlays-location-lower-third-preview.mp4',
		},
		previewPadding: 300,
		slug: 'overlays/location-lower-third',
		installationMode: 'wrapped',
		width: 1920,
	},
	'overlays/lower-third': {
		category: 'overlays',
		component: NameLowerThird,
		contributors: [],
		description:
			'A clean animated lower third for introducing a speaker, guest, or host.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		displayName: 'Name Lower Third',
		durationInFrames: 120,
		elementHeight: 138,
		elementWidth: 680,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			posterUrl:
				'https://remotion.media/elements/overlays-lower-third-preview.png',
			videoUrl:
				'https://remotion.media/elements/overlays-lower-third-preview.mp4',
		},
		previewPadding: 300,
		slug: 'overlays/lower-third',
		installationMode: 'wrapped',
		width: 1920,
	},
	'data/horizontal-bar-chart': {
		category: 'data',
		component: HorizontalBarChart,
		contributors: [],
		description:
			'A bold bar chart card with three directly labeled data points.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		displayName: 'Horizontal Bar Chart',
		durationInFrames: 120,
		elementHeight: 864,
		elementWidth: 1560,
		fps: 30,
		height: 1080,
		posterFrame: 70,
		preview: {
			posterUrl:
				'https://remotion.media/elements/data-horizontal-bar-chart-preview.png',
			videoUrl:
				'https://remotion.media/elements/data-horizontal-bar-chart-preview.mp4',
		},
		previewPadding: 56,
		slug: 'data/horizontal-bar-chart',
		installationMode: 'wrapped',
		width: 1920,
	},
	'data/number-counter': {
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
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		displayName: 'Number Counter',
		durationInFrames: 120,
		elementHeight: 200,
		elementWidth: 640,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			posterUrl:
				'https://remotion.media/elements/data-number-counter-preview.png',
			videoUrl:
				'https://remotion.media/elements/data-number-counter-preview.mp4',
		},
		previewPadding: 120,
		slug: 'data/number-counter',
		installationMode: 'wrapped',
		width: 1920,
	},
	'data/product-offer': {
		category: 'data',
		component: ProductOffer,
		contributors: [],
		description:
			'An animated product card with a bold title, catalog image, pricing, and discount.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		displayName: 'Product Offer',
		durationInFrames: 150,
		elementHeight: 900,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 75,
		preview: {
			posterUrl:
				'https://remotion.media/elements/data-product-offer-preview.png',
			videoUrl:
				'https://remotion.media/elements/data-product-offer-preview.mp4',
		},
		previewPadding: 90,
		slug: 'data/product-offer',
		installationMode: 'wrapped',
		width: 1080,
	},
	'text/circle-marker': {
		category: 'text',
		component: CircleMarker,
		contributors: [],
		description:
			'An animated hand-drawn circle with posterized drawing progress and shape changes.',
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/rough-notation', version: null},
		],
		displayName: 'Circle Marker',
		durationInFrames: 120,
		elementHeight: 220,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			posterUrl:
				'https://remotion.media/elements/text-circle-marker-preview.png',
			videoUrl:
				'https://remotion.media/elements/text-circle-marker-preview.mp4',
		},
		previewPadding: 120,
		slug: 'text/circle-marker',
		installationMode: 'wrapped',
		width: 1920,
	},
	'text/crossed-off': {
		category: 'text',
		component: CrossedOffText,
		contributors: [],
		description:
			'An animated hand-drawn cross for removing a word or phrase with emphasis.',
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/rough-notation', version: null},
		],
		displayName: 'Crossed Off',
		durationInFrames: 120,
		elementHeight: 220,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			posterUrl: 'https://remotion.media/elements/text-crossed-off-preview.png',
			videoUrl: 'https://remotion.media/elements/text-crossed-off-preview.mp4',
		},
		previewPadding: 120,
		slug: 'text/crossed-off',
		installationMode: 'wrapped',
		width: 1920,
	},
	'text/news-article-headline-highlight': {
		category: 'text',
		component: NewsArticleHeadlineHighlight,
		contributors: [],
		description:
			'A framed news article with camera movement, blur, and animated passage highlights.',
		dependencies: [{name: '@remotion/rough-notation', version: null}],
		displayName: 'News Article Headline Highlight',
		durationInFrames: 150,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 100,
		preview: {
			posterUrl:
				'https://remotion.media/elements/text-news-article-headline-highlight-preview.png',
			videoUrl:
				'https://remotion.media/elements/text-news-article-headline-highlight-preview.mp4',
		},
		previewPadding: 0,
		slug: 'text/news-article-headline-highlight',
		installationMode: 'wrapped',
		width: 1920,
	},
	'text/strike-through': {
		category: 'text',
		component: StrikeThroughText,
		contributors: [],
		description:
			'An animated hand-drawn line for striking through a word or phrase.',
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/rough-notation', version: null},
		],
		displayName: 'Strike Through',
		durationInFrames: 120,
		elementHeight: 220,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			posterUrl:
				'https://remotion.media/elements/text-strike-through-preview.png',
			videoUrl:
				'https://remotion.media/elements/text-strike-through-preview.mp4',
		},
		previewPadding: 120,
		slug: 'text/strike-through',
		installationMode: 'wrapped',
		width: 1920,
	},
	'text/text-marker': {
		category: 'text',
		component: TextMarker,
		contributors: [],
		description:
			'A hand-drawn animated text marker for calling attention to one phrase.',
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/rough-notation', version: null},
		],
		displayName: 'Text Marker',
		durationInFrames: 120,
		elementHeight: 220,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			posterUrl: 'https://remotion.media/elements/text-text-marker-preview.png',
			videoUrl: 'https://remotion.media/elements/text-text-marker-preview.mp4',
		},
		previewPadding: 120,
		slug: 'text/text-marker',
		installationMode: 'wrapped',
		width: 1920,
	},
	'captions/moving-pill-captions': {
		category: 'captions',
		component: MovingPillCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		description:
			'Synchronized captions with a pill that moves between spoken words.',
		dependencies: [
			{name: '@remotion/captions', version: null},
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/layout-utils', version: null},
		],
		displayName: 'Moving Pill Captions',
		durationInFrames: 210,
		elementHeight: 180,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 75,
		preview: {
			posterUrl:
				'https://remotion.media/elements/captions-moving-pill-captions-preview.png',
			videoUrl:
				'https://remotion.media/elements/captions-moving-pill-captions-preview.mp4',
		},
		previewPadding: 120,
		slug: 'captions/moving-pill-captions',
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	'captions/popping-word-captions': {
		category: 'captions',
		component: PoppingWordCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		description: 'Synchronized captions that pop each spoken word into focus.',
		dependencies: [
			{name: '@remotion/captions', version: null},
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/layout-utils', version: null},
		],
		displayName: 'Popping Word Captions',
		durationInFrames: 210,
		elementHeight: 180,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 75,
		preview: {
			posterUrl:
				'https://remotion.media/elements/captions-popping-word-captions-preview.png',
			videoUrl:
				'https://remotion.media/elements/captions-popping-word-captions-preview.mp4',
		},
		previewPadding: 120,
		slug: 'captions/popping-word-captions',
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	'captions/word-highlight-captions': {
		category: 'captions',
		component: WordHighlightCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		description: 'Synchronized captions that highlight each spoken word.',
		dependencies: [
			{name: '@remotion/captions', version: null},
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/layout-utils', version: null},
		],
		displayName: 'Word Highlight Captions',
		durationInFrames: 210,
		elementHeight: 180,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 75,
		preview: {
			posterUrl:
				'https://remotion.media/elements/captions-word-highlight-captions-preview.png',
			videoUrl:
				'https://remotion.media/elements/captions-word-highlight-captions-preview.mp4',
		},
		previewPadding: 120,
		slug: 'captions/word-highlight-captions',
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
} satisfies Record<string, ElementDefinition>;
