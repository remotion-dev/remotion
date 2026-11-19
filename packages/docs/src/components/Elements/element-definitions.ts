import {ding, mouseClick} from '@remotion/sfx';
import type {
	ElementAsset,
	ElementDependency,
	ElementInitialProps,
	ElementInstallationMode,
} from '@remotion/studio-protocol';
import {staticFileRef} from '@remotion/studio-protocol';
import type {ComponentType} from 'react';
import {MirroredAudioSpectrum} from '../../../elements/audio/mirrored-spectrum/mirrored-spectrum';
import {AudioOscilloscope} from '../../../elements/audio/oscilloscope/audio-oscilloscope';
import {
	audioOscilloscopeAudio,
	audioOscilloscopeInitialProps,
} from '../../../elements/audio/oscilloscope/initial-props';
import {AudioWaveformProgress} from '../../../elements/audio/waveform-progress/audio-waveform-progress';
import {LiquidContours} from '../../../elements/backgrounds/liquid-contours/liquid-contours';
import {MovingWaves} from '../../../elements/backgrounds/moving-waves/moving-waves';
import {MovingZigzags} from '../../../elements/backgrounds/moving-zigzags/moving-zigzags';
import {NotebookPaper} from '../../../elements/backgrounds/notebook-paper/notebook-paper';
import {PaperTexture} from '../../../elements/backgrounds/paper-texture/paper-texture';
import {RotatingStarburst} from '../../../elements/backgrounds/rotating-starburst/rotating-starburst';
import {BasicCaptions} from '../../../elements/captions/basic-captions/basic-captions';
import {basicCaptionsInitialProps} from '../../../elements/captions/basic-captions/initial-props';
import {movingPillCaptionsInitialProps} from '../../../elements/captions/moving-pill-captions/initial-props';
import {MovingPillCaptions} from '../../../elements/captions/moving-pill-captions/moving-pill-captions';
import {poppingWordCaptionsInitialProps} from '../../../elements/captions/popping-word-captions/initial-props';
import {PoppingWordCaptions} from '../../../elements/captions/popping-word-captions/popping-word-captions';
import {roundedCaptionsInitialProps} from '../../../elements/captions/rounded-captions/initial-props';
import {RoundedCaptions} from '../../../elements/captions/rounded-captions/rounded-captions';
import {wordHighlightCaptionsInitialProps} from '../../../elements/captions/word-highlight-captions/initial-props';
import {WordHighlightCaptions} from '../../../elements/captions/word-highlight-captions/word-highlight-captions';
import {Peel} from '../../../elements/commerce/peel/peel';
import {ProductCollection} from '../../../elements/commerce/product-collection/product-collection';
import {ProductDiscountCallout} from '../../../elements/commerce/product-discount-callout/product-discount-callout';
import {Shine} from '../../../elements/commerce/shine/shine';
import {Tear} from '../../../elements/commerce/tear/tear';
import {HorizontalBarChart} from '../../../elements/data/horizontal-bar-chart/horizontal-bar-chart';
import {LineChart} from '../../../elements/data/line-chart/line-chart';
import {NumberCounter} from '../../../elements/data/number-counter/number-counter';
import {PieChart} from '../../../elements/data/pie-chart/pie-chart';
import {VerticalBarChart} from '../../../elements/data/vertical-bar-chart/vertical-bar-chart';
import {PictureInPictureTransition} from '../../../elements/layouts/picture-in-picture-transition/picture-in-picture-transition';
import {SlideToSplitScreen} from '../../../elements/layouts/slide-to-split-screen/slide-to-split-screen';
import {MapFlyover} from '../../../elements/maps/map-flyover/a-to-b-map-flyover';
import {
	spinningGlobeInitialProps,
	spinningGlobeTexture,
} from '../../../elements/maps/spinning-globe/initial-props';
import {SpinningGlobe} from '../../../elements/maps/spinning-globe/spinning-globe';
import {WatercolorMap} from '../../../elements/maps/watercolor-map/watercolor-map';
import {LocationLowerThird} from '../../../elements/overlays/location-lower-third/location-lower-third';
import {NameLowerThird} from '../../../elements/overlays/name-lower-third/name-lower-third';
import {SocialSafeZones} from '../../../elements/overlays/social-safe-zones/social-safe-zones';
import {OnScreenMessages} from '../../../elements/storytelling/on-screen-messages/on-screen-messages';
import {PolaroidPictures} from '../../../elements/storytelling/polaroid-pictures/polaroid-pictures';
import {speedLinesInitialProps} from '../../../elements/storytelling/speed-lines/initial-props';
import {SpeedLines} from '../../../elements/storytelling/speed-lines/speed-lines';
import {CircleMarker} from '../../../elements/text/circle-marker/circle-marker';
import {CrossedOffText} from '../../../elements/text/crossed-off/crossed-off';
import {CylinderText} from '../../../elements/text/cylinder-text/cylinder-text';
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

export type ElementPreviewLayout = 'composition' | 'vertical';

export type ElementBackgroundTheme = 'light' | 'dark';

export type ElementPreviewMetadata = {
	readonly backgroundTheme: ElementBackgroundTheme;
	readonly previewLayout: ElementPreviewLayout;
	readonly posterUrl:
		| `/elements/${string}-preview.png`
		| `https://remotion.media/elements/${string}-preview.png`
		| `https://remotion.media/elements/${string}-preview-${string}.png`;
	readonly videoUrl:
		| `/elements/${string}-preview.mp4`
		| `https://remotion.media/elements/${string}-preview.mp4`
		| `https://remotion.media/elements/${string}-preview-${string}.mp4`;
};

export type ElementDefinition = {
	readonly assets: readonly ElementAsset[];
	readonly category: ElementCategory;
	readonly component: ComponentType<never>;
	readonly contributors: readonly Contributor[];
	readonly dependencies: readonly ElementDependency[];
	readonly description: string;
	readonly displayName: string;
	readonly durationInFrames: number;
	readonly elementHeight: number | null;
	readonly elementWidth: number | null;
	readonly fps: number;
	readonly height: number;
	readonly initialProps: ElementInitialProps | null;
	// Shallow overrides for installation only; previews use initialProps unchanged.
	readonly installationProps: ElementInitialProps | null;
	readonly posterFrame: number;
	readonly preview: ElementPreviewMetadata;
	readonly previewUsesHtmlInCanvas: boolean;
	readonly safeArea: number;
	readonly slug: string;
	readonly installationMode: ElementInstallationMode;
	readonly width: number;
};

const youtubeSubscribeNudgeAssets = {
	click: {
		path: 'elements/youtube-subscribe-nudge/mouse-click.wav',
		type: 'url',
		url: mouseClick,
	},
	ding: {
		path: 'elements/youtube-subscribe-nudge/ding.wav',
		type: 'url',
		url: ding,
	},
	avatar: {
		path: 'elements/youtube-subscribe-nudge/remotion-logo.png',
		type: 'url',
		url: 'https://remotion.media/elements/social-endcard-remotion-logo.png',
	},
} as const satisfies Record<string, ElementAsset>;

// Array order defines the order of cards within each category. Category order comes from element-registry.ts.
const elementImplementations = [
	{
		slug: 'audio/oscilloscope',
		assets: [audioOscilloscopeAudio],
		installationProps: {
			src: staticFileRef(audioOscilloscopeAudio.path),
		} as ElementInitialProps,
		component: AudioOscilloscope,
		contributors: [{username: 'samohovets', contribution: 'Author'}],
		dependencies: [
			{name: '@remotion/media', version: null},
			{name: '@remotion/media-utils', version: null},
		],
		durationInFrames: 271,
		elementHeight: 300,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 105,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/audio-oscilloscope-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/audio-oscilloscope-preview.mp4',
		},
		safeArea: 120,
		initialProps: audioOscilloscopeInitialProps,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'audio/waveform-progress',
		assets: [audioOscilloscopeAudio],
		installationProps: {
			src: staticFileRef(audioOscilloscopeAudio.path),
		} as ElementInitialProps,
		component: AudioWaveformProgress,
		contributors: [{username: 'samohovets', contribution: 'Author'}],
		dependencies: [
			{name: '@remotion/media', version: null},
			{name: '@remotion/media-utils', version: null},
		],
		durationInFrames: 271,
		elementHeight: 300,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 105,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/audio-waveform-progress-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/audio-waveform-progress-preview.mp4',
		},
		safeArea: 120,
		initialProps: {src: audioOscilloscopeAudio.url} as ElementInitialProps,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'audio/mirrored-spectrum',
		assets: [audioOscilloscopeAudio],
		installationProps: {
			src: staticFileRef(audioOscilloscopeAudio.path),
		} as ElementInitialProps,
		component: MirroredAudioSpectrum,
		contributors: [{username: 'JonnyBurger', contribution: 'Author'}],
		dependencies: [
			{name: '@remotion/media', version: null},
			{name: '@remotion/media-utils', version: null},
		],
		durationInFrames: 271,
		elementHeight: 300,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 105,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/audio-mirrored-spectrum-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/audio-mirrored-spectrum-preview.mp4',
		},
		safeArea: 120,
		initialProps: {src: audioOscilloscopeAudio.url} as ElementInitialProps,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'backgrounds/notebook-paper',
		assets: [],
		installationProps: null,
		component: NotebookPaper,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 0,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/backgrounds-notebook-paper-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/backgrounds-notebook-paper-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'backgrounds/paper-texture',
		assets: [],
		installationProps: null,
		component: PaperTexture,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/backgrounds-paper-texture-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/backgrounds-paper-texture-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'backgrounds/rotating-starburst',
		assets: [],
		installationProps: null,
		component: RotatingStarburst,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 240,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 120,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/backgrounds-rotating-starburst-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/backgrounds-rotating-starburst-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'backgrounds/moving-waves',
		assets: [],
		installationProps: null,
		component: MovingWaves,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 240,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 120,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/backgrounds-moving-waves-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/backgrounds-moving-waves-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'backgrounds/moving-zigzags',
		assets: [],
		installationProps: null,
		component: MovingZigzags,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 240,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 120,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/backgrounds-moving-zigzags-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/backgrounds-moving-zigzags-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'backgrounds/liquid-contours',
		assets: [],
		installationProps: null,
		component: LiquidContours,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 240,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 120,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/backgrounds-liquid-contours-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/backgrounds-liquid-contours-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'captions/basic-captions',
		assets: [],
		installationProps: null,
		component: BasicCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		dependencies: [{name: '@remotion/captions', version: null}],
		durationInFrames: 210,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 300,
		posterFrame: 75,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/captions-basic-captions-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/captions-basic-captions-preview.mp4',
		},
		safeArea: 120,
		initialProps: basicCaptionsInitialProps,
		installationMode: 'component-owned-sequence',
		width: 900,
	},
	{
		slug: 'captions/rounded-captions',
		assets: [],
		installationProps: null,
		component: RoundedCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		dependencies: [
			{name: '@remotion/captions', version: null},
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/layout-utils', version: null},
			{name: '@remotion/rounded-text-box', version: null},
		],
		durationInFrames: 210,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 300,
		posterFrame: 75,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/captions-rounded-captions-preview-694426c4-721c-484f-8a33-79f21d54da5d.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/captions-rounded-captions-preview-694426c4-721c-484f-8a33-79f21d54da5d.mp4',
		},
		safeArea: 120,
		initialProps: roundedCaptionsInitialProps,
		installationMode: 'component-owned-sequence',
		width: 900,
	},
	{
		slug: 'captions/moving-pill-captions',
		assets: [],
		installationProps: null,
		component: MovingPillCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		dependencies: [
			{name: '@remotion/captions', version: null},
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/layout-utils', version: null},
		],
		durationInFrames: 210,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 300,
		posterFrame: 75,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/captions-moving-pill-captions-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/captions-moving-pill-captions-preview.mp4',
		},
		safeArea: 120,
		initialProps: movingPillCaptionsInitialProps,
		installationMode: 'component-owned-sequence',
		width: 682,
	},
	{
		slug: 'captions/popping-word-captions',
		assets: [],
		installationProps: null,
		component: PoppingWordCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		dependencies: [
			{name: '@remotion/captions', version: null},
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/layout-utils', version: null},
		],
		durationInFrames: 210,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 300,
		posterFrame: 75,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/captions-popping-word-captions-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/captions-popping-word-captions-preview.mp4',
		},
		safeArea: 120,
		initialProps: poppingWordCaptionsInitialProps,
		installationMode: 'component-owned-sequence',
		width: 682,
	},
	{
		slug: 'captions/word-highlight-captions',
		assets: [],
		installationProps: null,
		component: WordHighlightCaptions,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		dependencies: [
			{name: '@remotion/captions', version: null},
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/layout-utils', version: null},
		],
		durationInFrames: 210,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 300,
		posterFrame: 75,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/captions-word-highlight-captions-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/captions-word-highlight-captions-preview.mp4',
		},
		safeArea: 120,
		initialProps: wordHighlightCaptionsInitialProps,
		installationMode: 'component-owned-sequence',
		width: 682,
	},
	{
		slug: 'commerce/product-collection',
		assets: [],
		installationProps: null,
		component: ProductCollection,
		contributors: [],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 150,
		elementHeight: 1020,
		elementWidth: 1020,
		fps: 30,
		height: 1080,
		posterFrame: 73,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/commerce-product-collection-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/commerce-product-collection-preview.mp4',
		},
		safeArea: 30,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1080,
	},
	{
		slug: 'commerce/product-discount-callout',
		assets: [],
		installationProps: null,
		component: ProductDiscountCallout,
		contributors: [],
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: '@remotion/shapes', version: null},
		],
		durationInFrames: 120,
		elementHeight: 760,
		elementWidth: 760,
		fps: 30,
		height: 1080,
		posterFrame: 57,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/commerce-product-discount-callout-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/commerce-product-discount-callout-preview.mp4',
		},
		safeArea: 90,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1080,
	},
	{
		slug: 'commerce/peel',
		assets: [],
		installationProps: null,
		component: Peel,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 60,
		elementHeight: 720,
		elementWidth: 1280,
		fps: 30,
		height: 1080,
		posterFrame: 24,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/commerce-peel-preview-57fbe8da-01d3-405c-82f9-84707b1ce6fa.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/commerce-peel-preview-57fbe8da-01d3-405c-82f9-84707b1ce6fa.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'commerce/shine',
		assets: [],
		installationProps: null,
		component: Shine,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 45,
		elementHeight: 720,
		elementWidth: 1280,
		fps: 30,
		height: 1080,
		posterFrame: 22,
		preview: {
			previewLayout: 'composition',
			posterUrl: 'https://remotion.media/elements/commerce-shine-preview.png',
			backgroundTheme: 'light',
			videoUrl: 'https://remotion.media/elements/commerce-shine-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'commerce/tear',
		assets: [],
		installationProps: null,
		component: Tear,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 45,
		elementHeight: 720,
		elementWidth: 1280,
		fps: 30,
		height: 1080,
		posterFrame: 25,
		preview: {
			previewLayout: 'composition',
			posterUrl: 'https://remotion.media/elements/commerce-tear-preview.png',
			backgroundTheme: 'light',
			videoUrl: 'https://remotion.media/elements/commerce-tear-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'data/horizontal-bar-chart',
		assets: [],
		installationProps: null,
		component: HorizontalBarChart,
		contributors: [],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 70,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/data-horizontal-bar-chart-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/data-horizontal-bar-chart-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'data/line-chart',
		assets: [],
		installationProps: null,
		component: LineChart,
		contributors: [],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 70,
		preview: {
			previewLayout: 'composition',
			posterUrl: 'https://remotion.media/elements/data-line-chart-preview.png',
			backgroundTheme: 'light',
			videoUrl: 'https://remotion.media/elements/data-line-chart-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'data/number-counter',
		assets: [],
		installationProps: null,
		component: NumberCounter,
		contributors: [
			{
				username: 'KapishDima',
				contribution: 'Author',
			},
		],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: 200,
		elementWidth: 640,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/data-number-counter-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/data-number-counter-preview.mp4',
		},
		safeArea: 120,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'data/pie-chart',
		assets: [],
		installationProps: null,
		component: PieChart,
		contributors: [],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 70,
		preview: {
			previewLayout: 'composition',
			posterUrl: 'https://remotion.media/elements/data-pie-chart-preview.png',
			backgroundTheme: 'light',
			videoUrl: 'https://remotion.media/elements/data-pie-chart-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'data/vertical-bar-chart',
		assets: [],
		installationProps: null,
		component: VerticalBarChart,
		contributors: [],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 115,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/data-vertical-bar-chart-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/data-vertical-bar-chart-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'layouts/picture-in-picture-transition',
		assets: [],
		installationProps: null,
		component: PictureInPictureTransition,
		contributors: [],
		dependencies: [],
		durationInFrames: 150,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 75,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/layouts-picture-in-picture-transition-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/layouts-picture-in-picture-transition-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'layouts/slide-to-split-screen',
		assets: [],
		installationProps: null,
		component: SlideToSplitScreen,
		contributors: [],
		dependencies: [],
		durationInFrames: 150,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 75,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/layouts-slide-to-split-screen-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/layouts-slide-to-split-screen-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'maps/map-flyover',
		assets: [],
		installationProps: null,
		component: MapFlyover,
		contributors: [],
		dependencies: [
			{name: '@turf/turf', version: '7.3.2'},
			{name: 'maplibre-gl', version: '6.4.1'},
		],
		durationInFrames: 285,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 240,
		preview: {
			previewLayout: 'composition',
			posterUrl: 'https://remotion.media/elements/maps-map-flyover-preview.png',
			backgroundTheme: 'light',
			videoUrl: 'https://remotion.media/elements/maps-map-flyover-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'maps/spinning-globe',
		assets: [spinningGlobeTexture],
		installationProps: {
			src: staticFileRef(spinningGlobeTexture.path),
		} as ElementInitialProps,
		component: SpinningGlobe,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 240,
		elementHeight: 840,
		elementWidth: 840,
		fps: 30,
		height: 1080,
		posterFrame: 0,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/maps-spinning-globe-preview-074f0f12-5bf4-4357-a622-5afe8a371b5d.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/maps-spinning-globe-preview-074f0f12-5bf4-4357-a622-5afe8a371b5d.mp4',
		},
		safeArea: 0,
		initialProps: spinningGlobeInitialProps,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'maps/watercolor-map',
		assets: [],
		installationProps: null,
		component: WatercolorMap,
		contributors: [
			{username: 'JonnyBurger', contribution: 'Author'},
			{username: 'MehmetAdemi', contribution: 'Author'},
		],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 200,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 145,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/maps-watercolor-map-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/maps-watercolor-map-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'overlays/location-lower-third',
		assets: [],
		installationProps: null,
		component: LocationLowerThird,
		contributors: [],
		dependencies: [],
		durationInFrames: 120,
		elementHeight: 138,
		elementWidth: 680,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/overlays-location-lower-third-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/overlays-location-lower-third-preview.mp4',
		},
		safeArea: 300,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'overlays/name-lower-third',
		assets: [],
		installationProps: null,
		component: NameLowerThird,
		contributors: [],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: 132,
		elementWidth: 534,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/overlays-name-lower-third-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/overlays-name-lower-third-preview.mp4',
		},
		safeArea: 300,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'overlays/social-safe-zones',
		assets: [],
		installationProps: null,
		component: SocialSafeZones,
		contributors: [],
		dependencies: [],
		durationInFrames: 120,
		elementHeight: 1920,
		elementWidth: 1080,
		fps: 30,
		height: 1920,
		posterFrame: 0,
		preview: {
			previewLayout: 'vertical',
			posterUrl:
				'https://remotion.media/elements/overlays-social-safe-zones-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/overlays-social-safe-zones-preview.mp4',
		},
		safeArea: 0,
		initialProps: {platform: 'tiktok'},
		installationMode: 'component-owned-sequence',
		width: 1080,
	},
	{
		slug: 'text/news-article-highlight',
		assets: [],
		installationProps: null,
		component: NewsArticleHighlight,
		contributors: [],
		dependencies: [{name: '@remotion/rough-notation', version: null}],
		durationInFrames: 150,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 100,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/text-news-article-highlight-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/text-news-article-highlight-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'storytelling/speed-lines',
		assets: [],
		installationProps: null,
		component: SpeedLines,
		contributors: [],
		dependencies: [],
		durationInFrames: 45,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 15,
		preview: {
			backgroundTheme: 'dark',
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/storytelling-speed-lines-preview-589e0765-d9d0-4d46-bcff-86e7bcf79c05.png',
			videoUrl:
				'https://remotion.media/elements/storytelling-speed-lines-preview-589e0765-d9d0-4d46-bcff-86e7bcf79c05.mp4',
		},
		safeArea: 0,
		initialProps: speedLinesInitialProps as ElementInitialProps,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'storytelling/on-screen-messages',
		assets: [],
		installationProps: null,
		component: OnScreenMessages,
		contributors: [],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 162,
		elementHeight: 680,
		elementWidth: 1260,
		fps: 30,
		height: 1080,
		posterFrame: 114,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/storytelling-on-screen-messages-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/storytelling-on-screen-messages-preview.mp4',
		},
		safeArea: 180,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'storytelling/polaroid-pictures',
		assets: [],
		installationProps: null,
		component: PolaroidPictures,
		contributors: [],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 150,
		elementHeight: 640,
		elementWidth: 1480,
		fps: 30,
		height: 1080,
		posterFrame: 82,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/storytelling-polaroid-pictures-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/storytelling-polaroid-pictures-preview.mp4',
		},
		safeArea: 220,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'text/circle-marker',
		assets: [],
		installationProps: null,
		component: CircleMarker,
		contributors: [],
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
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/text-circle-marker-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/text-circle-marker-preview.mp4',
		},
		safeArea: 120,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'text/crossed-off',
		assets: [],
		installationProps: null,
		component: CrossedOffText,
		contributors: [],
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
			previewLayout: 'composition',
			posterUrl: 'https://remotion.media/elements/text-crossed-off-preview.png',
			backgroundTheme: 'light',
			videoUrl: 'https://remotion.media/elements/text-crossed-off-preview.mp4',
		},
		safeArea: 120,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'text/cylinder-text',
		assets: [],
		installationProps: null,
		component: CylinderText,
		contributors: [],
		dependencies: [{name: '@remotion/effects', version: null}],
		durationInFrames: 180,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 30,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/text-cylinder-text-preview-97956be8-ce8a-4d79-a9aa-f631bbe6dba9.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/text-cylinder-text-preview-97956be8-ce8a-4d79-a9aa-f631bbe6dba9.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'text/spinning-text-wheel',
		assets: [],
		installationProps: null,
		component: SpinningTextWheel,
		contributors: [{username: 'JonnyBurger', contribution: null}],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 120,
		elementHeight: 200,
		elementWidth: 400,
		fps: 30,
		height: 1080,
		posterFrame: 105,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/text-spinning-text-wheel-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/text-spinning-text-wheel-preview.mp4',
		},
		safeArea: 120,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'text/strike-through',
		assets: [],
		installationProps: null,
		component: StrikeThroughText,
		contributors: [],
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
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/text-strike-through-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/text-strike-through-preview.mp4',
		},
		safeArea: 120,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'text/text-marker',
		assets: [],
		installationProps: null,
		component: TextMarker,
		contributors: [],
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
			previewLayout: 'composition',
			posterUrl: 'https://remotion.media/elements/text-text-marker-preview.png',
			backgroundTheme: 'light',
			videoUrl: 'https://remotion.media/elements/text-text-marker-preview.mp4',
		},
		safeArea: 120,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'youtube/youtube-comment-highlight',
		assets: [],
		installationProps: null,
		component: YouTubeCommentHighlight,
		contributors: [],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 180,
		elementHeight: 360,
		elementWidth: 1120,
		fps: 30,
		height: 1080,
		posterFrame: 135,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/youtube-youtube-comment-highlight-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/youtube-youtube-comment-highlight-preview.mp4',
		},
		safeArea: 200,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'youtube/youtube-end-card',
		assets: [],
		installationProps: null,
		component: YouTubeEndCard,
		contributors: [],
		dependencies: [{name: '@remotion/google-fonts', version: null}],
		durationInFrames: 150,
		elementHeight: null,
		elementWidth: null,
		fps: 30,
		height: 1080,
		posterFrame: 75,
		preview: {
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/overlays-social-endcard-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/overlays-social-endcard-preview.mp4',
		},
		safeArea: 0,
		initialProps: null,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
	{
		slug: 'youtube/youtube-subscribe-nudge',
		assets: [
			youtubeSubscribeNudgeAssets.click,
			youtubeSubscribeNudgeAssets.ding,
			youtubeSubscribeNudgeAssets.avatar,
		],
		installationProps: {
			clickSrc: staticFileRef(youtubeSubscribeNudgeAssets.click.path),
			dingSrc: staticFileRef(youtubeSubscribeNudgeAssets.ding.path),
			avatarSrc: staticFileRef(youtubeSubscribeNudgeAssets.avatar.path),
		} as ElementInitialProps,
		component: YouTubeSubscribeNudge,
		contributors: [],
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
			previewLayout: 'composition',
			posterUrl:
				'https://remotion.media/elements/youtube-youtube-subscribe-nudge-preview.png',
			backgroundTheme: 'light',
			videoUrl:
				'https://remotion.media/elements/youtube-youtube-subscribe-nudge-preview.mp4',
		},
		safeArea: 240,
		initialProps: {
			clickSrc: youtubeSubscribeNudgeAssets.click.url,
			dingSrc: youtubeSubscribeNudgeAssets.ding.url,
			avatarSrc: youtubeSubscribeNudgeAssets.avatar.url,
		} as ElementInitialProps,
		installationMode: 'component-owned-sequence',
		width: 1920,
	},
] satisfies readonly (Omit<
	ElementDefinition,
	| 'category'
	| 'description'
	| 'displayName'
	| 'previewUsesHtmlInCanvas'
	| 'slug'
> & {
	readonly slug: ElementSlug;
})[];

const htmlInCanvasElementSlugs = new Set<ElementSlug>([
	'commerce/peel',
	'commerce/shine',
	'commerce/tear',
	'text/cylinder-text',
]);

export const elementDefinitions = elementImplementations.map((definition) => ({
	...elementRegistry[definition.slug],
	...definition,
	previewUsesHtmlInCanvas: htmlInCanvasElementSlugs.has(definition.slug),
}));
