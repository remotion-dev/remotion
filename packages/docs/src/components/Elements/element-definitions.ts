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
import {ProductCollection} from '../../../elements/commerce/product-collection/product-collection';
import {ProductDiscountCallout} from '../../../elements/commerce/product-discount-callout/product-discount-callout';
import {ProductOffer} from '../../../elements/commerce/product-offer/product-offer';
import {HorizontalBarChart} from '../../../elements/data/horizontal-bar-chart/horizontal-bar-chart';
import {LineChart} from '../../../elements/data/line-chart/line-chart';
import {NumberCounter} from '../../../elements/data/number-counter/number-counter';
import {PieChart} from '../../../elements/data/pie-chart/pie-chart';
import {VerticalBarChart} from '../../../elements/data/vertical-bar-chart/vertical-bar-chart';
import {MapFlyover} from '../../../elements/maps/map-flyover/a-to-b-map-flyover';
import {WatercolorMap} from '../../../elements/maps/watercolor-map/watercolor-map';
import {LocationLowerThird} from '../../../elements/overlays/location-lower-third/location-lower-third';
import {NameLowerThird} from '../../../elements/overlays/name-lower-third/name-lower-third';
import {OnScreenMessages} from '../../../elements/storytelling/on-screen-messages/on-screen-messages';
import {PolaroidPictures} from '../../../elements/storytelling/polaroid-pictures/polaroid-pictures';
import {CircleMarker} from '../../../elements/text/circle-marker/circle-marker';
import {CrossedOffText} from '../../../elements/text/crossed-off/crossed-off';
import {NewsArticleHighlight} from '../../../elements/text/news-article-highlight/news-article-highlight';
import {SpinningTextWheel} from '../../../elements/text/spinning-text-wheel/spinning-text-wheel';
import {StrikeThroughText} from '../../../elements/text/strike-through/strike-through';
import {TextMarker} from '../../../elements/text/text-marker/text-marker';
import {YouTubeCommentHighlight} from '../../../elements/youtube/youtube-comment-highlight/youtube-comment-highlight';
import {YouTubeEndCard} from '../../../elements/youtube/youtube-end-card/youtube-end-card';
import {YouTubeSubscribeNudge} from '../../../elements/youtube/youtube-subscribe-nudge/youtube-subscribe-nudge';
import type {Contributor} from '../Credits';
import {
	elementRegistry,
	type ElementCategory,
	type ElementSlug,
} from './element-registry';

export type ElementPreviewMetadata = {
	readonly posterUrl:
		| `/elements/${string}-preview.png`
		| `https://remotion.media/elements/${string}-preview.png`;
	readonly videoUrl:
		| `/elements/${string}-preview.mp4`
		| `https://remotion.media/elements/${string}-preview.mp4`;
};

export type ElementDefinition = {
	readonly category: ElementCategory;
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
	readonly safeArea: number;
	readonly slug: string;
	readonly installationMode: ElementInstallationMode;
	readonly width: number;
};

const elementImplementations = {
	'backgrounds/liquid-contours': {
		component: LiquidContours,
		contributors: [],
		description:
			'A flowing two-color background made from animated liquid contour bands.',
		dependencies: [{name: '@remotion/effects', version: null}],
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
		safeArea: 0,
		installationMode: 'wrapped',
		width: 1920,
	},
	'maps/map-flyover': {
		component: MapFlyover,
		contributors: [],
		description:
			'An animated map flyover from point A to point B, with editable coordinates, location labels, and a camera that follows the route.',
		dependencies: [
			{name: '@turf/turf', version: '7.3.2'},
			{name: 'maplibre-gl', version: '5.24.0'},
		],
		durationInFrames: 285,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 240,
		preview: {
			posterUrl: 'https://remotion.media/elements/maps-map-flyover-preview.png',
			videoUrl: 'https://remotion.media/elements/maps-map-flyover-preview.mp4',
		},
		safeArea: 0,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	'maps/watercolor-map': {
		component: WatercolorMap,
		contributors: [
			{username: 'JonnyBurger', contribution: 'Author'},
			{username: 'MehmetAdemi', contribution: 'Author'},
		],
		description:
			'A watercolor map journey between two editable locations, with animated labels, markers, and a hand-drawn route.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 200,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 145,
		preview: {
			posterUrl:
				'https://remotion.media/elements/maps-watercolor-map-preview.png',
			videoUrl:
				'https://remotion.media/elements/maps-watercolor-map-preview.mp4',
		},
		safeArea: 0,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	'backgrounds/notebook-paper': {
		component: NotebookPaper,
		contributors: [],
		description: 'A white paper background with subtle blue gridlines.',
		dependencies: [{name: '@remotion/effects', version: null}],
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
		safeArea: 0,
		installationMode: 'wrapped',
		width: 1920,
	},
	'backgrounds/paper-texture': {
		component: PaperTexture,
		contributors: [],
		description:
			'A white paper texture background with a slowly changing posterized seed.',
		dependencies: [{name: '@remotion/effects', version: null}],
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
		safeArea: 0,
		installationMode: 'wrapped',
		width: 1920,
	},
	'backgrounds/rotating-starburst': {
		component: RotatingStarburst,
		contributors: [],
		description: 'A solid background with a slowly rotating starburst effect.',
		dependencies: [{name: '@remotion/effects', version: null}],
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
		safeArea: 0,
		installationMode: 'wrapped',
		width: 1920,
	},
	'overlays/location-lower-third': {
		component: LocationLowerThird,
		contributors: [],
		description: 'An animated lower third for an event location and venue.',
		dependencies: [],
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
		safeArea: 300,
		installationMode: 'wrapped',
		width: 1920,
	},
	'overlays/name-lower-third': {
		component: NameLowerThird,
		contributors: [],
		description:
			'A clean animated lower third for introducing a speaker, guest, or host.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: 132,
		elementWidth: 534,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			posterUrl:
				'https://remotion.media/elements/overlays-name-lower-third-preview.png',
			videoUrl:
				'https://remotion.media/elements/overlays-name-lower-third-preview.mp4',
		},
		safeArea: 300,
		installationMode: 'wrapped',
		width: 1920,
	},
	'youtube/youtube-comment-highlight': {
		component: YouTubeCommentHighlight,
		contributors: [],
		description: 'A YouTube-style card for featuring a viewer comment.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 180,
		elementHeight: 360,
		elementWidth: 1120,
		fps: 30,
		height: 1080,
		posterFrame: 135,
		preview: {
			posterUrl:
				'https://remotion.media/elements/youtube-youtube-comment-highlight-preview.png',
			videoUrl:
				'https://remotion.media/elements/youtube-youtube-comment-highlight-preview.mp4',
		},
		safeArea: 200,
		installationMode: 'wrapped',
		width: 1920,
	},
	'youtube/youtube-end-card': {
		component: YouTubeEndCard,
		contributors: [],
		description:
			'A clean YouTube endcard with social links and space for recommended videos.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 150,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 75,
		preview: {
			posterUrl:
				'https://remotion.media/elements/overlays-social-endcard-preview.png',
			videoUrl:
				'https://remotion.media/elements/overlays-social-endcard-preview.mp4',
		},
		safeArea: 0,
		installationMode: 'wrapped',
		width: 1920,
	},
	'youtube/youtube-subscribe-nudge': {
		component: YouTubeSubscribeNudge,
		contributors: [],
		description:
			'An animated creator-branded subscribe prompt with a subscribed-state confirmation.',
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/media', version: null},
			{name: '@remotion/sfx', version: null},
		],
		durationInFrames: 120,
		elementHeight: 240,
		elementWidth: 760,
		fps: 30,
		height: 1080,
		posterFrame: 50,
		preview: {
			posterUrl:
				'https://remotion.media/elements/youtube-youtube-subscribe-nudge-preview.png',
			videoUrl:
				'https://remotion.media/elements/youtube-youtube-subscribe-nudge-preview.mp4',
		},
		safeArea: 240,
		installationMode: 'wrapped',
		width: 1920,
	},
	'data/horizontal-bar-chart': {
		component: HorizontalBarChart,
		contributors: [],
		description: 'A bold bar chart with three directly labeled data points.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 70,
		preview: {
			posterUrl:
				'https://remotion.media/elements/data-horizontal-bar-chart-preview.png',
			videoUrl:
				'https://remotion.media/elements/data-horizontal-bar-chart-preview.mp4',
		},
		safeArea: 0,
		installationMode: 'wrapped',
		width: 1920,
	},
	'data/line-chart': {
		component: LineChart,
		contributors: [],
		description: 'A bold animated line chart with a directly labeled trend.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 70,
		preview: {
			posterUrl: 'https://remotion.media/elements/data-line-chart-preview.png',
			videoUrl: 'https://remotion.media/elements/data-line-chart-preview.mp4',
		},
		safeArea: 0,
		installationMode: 'wrapped',
		width: 1920,
	},
	'data/pie-chart': {
		component: PieChart,
		contributors: [],
		description:
			'A bold animated pie chart with four directly labeled data points.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 70,
		preview: {
			posterUrl: 'https://remotion.media/elements/data-pie-chart-preview.png',
			videoUrl: 'https://remotion.media/elements/data-pie-chart-preview.mp4',
		},
		safeArea: 0,
		installationMode: 'wrapped',
		width: 1920,
	},
	'data/number-counter': {
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
		safeArea: 120,
		installationMode: 'wrapped',
		width: 1920,
	},
	'data/vertical-bar-chart': {
		component: VerticalBarChart,
		contributors: [],
		description:
			'A bold vertical bar chart with three directly labeled data points.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 115,
		preview: {
			posterUrl:
				'https://remotion.media/elements/data-vertical-bar-chart-preview.png',
			videoUrl:
				'https://remotion.media/elements/data-vertical-bar-chart-preview.mp4',
		},
		safeArea: 0,
		installationMode: 'wrapped',
		width: 1920,
	},
	'commerce/product-collection': {
		component: ProductCollection,
		contributors: [],
		description:
			'An animated product carousel that adapts to changing catalog images, titles, prices, and promotions.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 150,
		elementHeight: 1020,
		elementWidth: 1020,
		fps: 30,
		height: 1080,
		posterFrame: 90,
		preview: {
			posterUrl:
				'https://remotion.media/elements/commerce-product-collection-preview.png',
			videoUrl:
				'https://remotion.media/elements/commerce-product-collection-preview.mp4',
		},
		safeArea: 30,
		installationMode: 'wrapped',
		width: 1080,
	},
	'commerce/product-discount-callout': {
		component: ProductDiscountCallout,
		contributors: [],
		description:
			'An animated product cutout with pricing and a hinged discount callout.',
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/shapes', version: null},
		],
		durationInFrames: 120,
		elementHeight: 650,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 57,
		preview: {
			posterUrl:
				'https://remotion.media/elements/commerce-product-discount-callout-preview.png',
			videoUrl:
				'https://remotion.media/elements/commerce-product-discount-callout-preview.mp4',
		},
		safeArea: 90,
		installationMode: 'wrapped',
		width: 1080,
	},
	'commerce/product-offer': {
		component: ProductOffer,
		contributors: [],
		description:
			'An animated product card with a bold title, catalog image, pricing, and discount.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 150,
		elementHeight: 900,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 75,
		preview: {
			posterUrl:
				'https://remotion.media/elements/commerce-product-offer-preview.png',
			videoUrl:
				'https://remotion.media/elements/commerce-product-offer-preview.mp4',
		},
		safeArea: 90,
		installationMode: 'wrapped',
		width: 1080,
	},
	'text/circle-marker': {
		component: CircleMarker,
		contributors: [],
		description:
			'An animated hand-drawn circle with posterized drawing progress and shape changes.',
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/rough-notation', version: null},
		],
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
		safeArea: 120,
		installationMode: 'wrapped',
		width: 1920,
	},
	'text/crossed-off': {
		component: CrossedOffText,
		contributors: [],
		description:
			'An animated hand-drawn cross for removing a word or phrase with emphasis.',
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/rough-notation', version: null},
		],
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
		safeArea: 120,
		installationMode: 'wrapped',
		width: 1920,
	},
	'text/spinning-text-wheel': {
		component: SpinningTextWheel,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		description:
			'A 3D text wheel that spins through options and decelerates onto a highlighted selection.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: 200,
		elementWidth: 400,
		fps: 30,
		height: 1080,
		posterFrame: 105,
		preview: {
			posterUrl:
				'https://remotion.media/elements/text-spinning-text-wheel-preview.png',
			videoUrl:
				'https://remotion.media/elements/text-spinning-text-wheel-preview.mp4',
		},
		safeArea: 120,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	'storytelling/on-screen-messages': {
		component: OnScreenMessages,
		contributors: [],
		description:
			'A cinematic, brand-neutral text-message exchange with staggered reveals, focus shifts, and subtle editorial panels.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 150,
		elementHeight: 680,
		elementWidth: 1260,
		fps: 30,
		height: 1080,
		posterFrame: 100,
		preview: {
			posterUrl: '/elements/storytelling-on-screen-messages-preview.png',
			videoUrl: '/elements/storytelling-on-screen-messages-preview.mp4',
		},
		safeArea: 180,
		installationMode: 'wrapped',
		width: 1920,
	},
	'storytelling/polaroid-pictures': {
		component: PolaroidPictures,
		contributors: [],
		description:
			'A staggered instant-photo montage with handwritten captions, paper shadows, and developing-photo accents.',
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 150,
		elementHeight: 640,
		elementWidth: 1480,
		fps: 30,
		height: 1080,
		posterFrame: 82,
		preview: {
			posterUrl: '/elements/storytelling-polaroid-pictures-preview.png',
			videoUrl: '/elements/storytelling-polaroid-pictures-preview.mp4',
		},
		safeArea: 220,
		installationMode: 'wrapped',
		width: 1920,
	},
	'text/news-article-highlight': {
		component: NewsArticleHighlight,
		contributors: [],
		description:
			'A framed news article with camera movement, blur, and animated passage highlights.',
		dependencies: [{name: '@remotion/rough-notation', version: null}],
		durationInFrames: 150,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 100,
		preview: {
			posterUrl:
				'https://remotion.media/elements/text-news-article-highlight-preview.png',
			videoUrl:
				'https://remotion.media/elements/text-news-article-highlight-preview.mp4',
		},
		safeArea: 0,
		installationMode: 'wrapped',
		width: 1920,
	},
	'text/strike-through': {
		component: StrikeThroughText,
		contributors: [],
		description:
			'An animated hand-drawn line for striking through a word or phrase.',
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/rough-notation', version: null},
		],
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
		safeArea: 120,
		installationMode: 'wrapped',
		width: 1920,
	},
	'text/text-marker': {
		component: TextMarker,
		contributors: [],
		description:
			'A hand-drawn animated text marker for calling attention to one phrase.',
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/rough-notation', version: null},
		],
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
		safeArea: 120,
		installationMode: 'wrapped',
		width: 1920,
	},
	'captions/moving-pill-captions': {
		component: MovingPillCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		description:
			'Synchronized captions with a pill that moves between spoken words.',
		dependencies: [
			{name: '@remotion/captions', version: null},
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/layout-utils', version: null},
		],
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
		safeArea: 120,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	'captions/popping-word-captions': {
		component: PoppingWordCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		description: 'Synchronized captions that pop each spoken word into focus.',
		dependencies: [
			{name: '@remotion/captions', version: null},
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/layout-utils', version: null},
		],
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
		safeArea: 120,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	'captions/word-highlight-captions': {
		component: WordHighlightCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		description: 'Synchronized captions that highlight each spoken word.',
		dependencies: [
			{name: '@remotion/captions', version: null},
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/layout-utils', version: null},
		],
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
		safeArea: 120,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
} satisfies Record<
	ElementSlug,
	Omit<ElementDefinition, 'category' | 'displayName' | 'slug'>
>;

type ElementDefinitions = {
	readonly [Slug in ElementSlug]: ElementDefinition &
		(typeof elementRegistry)[Slug] & {readonly slug: Slug};
};

export const elementDefinitions = Object.fromEntries(
	(Object.keys(elementImplementations) as ElementSlug[]).map((slug) => [
		slug,
		{
			...elementRegistry[slug],
			...elementImplementations[slug],
			slug,
		},
	]),
) as ElementDefinitions;
