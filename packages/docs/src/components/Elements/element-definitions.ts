import type {ComponentType} from 'react';
import {PaperTexture} from '../../../elements/backgrounds/paper-texture/paper-texture';
import {RotatingStarburst} from '../../../elements/backgrounds/rotating-starburst/rotating-starburst';
import {NumberCounter} from '../../../elements/data/number-counter/number-counter';
import {LiveLocationStrap} from '../../../elements/overlays/live-location-strap/live-location-strap';
import {LowerThird} from '../../../elements/overlays/lower-third/lower-third';
import {CircleMarker} from '../../../elements/text/circle-marker/circle-marker';
import {CrossedOffText} from '../../../elements/text/crossed-off/crossed-off';
import {StrikeThroughText} from '../../../elements/text/strike-through/strike-through';
import {TextMarker} from '../../../elements/text/text-marker/text-marker';
import type {Contributor} from '../Credits';

export type ElementDefinition = {
	readonly category: string;
	readonly component: ComponentType<Record<never, never>>;
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

export const elementDefinitions = {
	'backgrounds/paper-texture': {
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
	},
	'backgrounds/rotating-starburst': {
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
	},
	'overlays/live-location-strap': {
		category: 'overlays',
		component: LiveLocationStrap,
		contributors: [
			{
				username: 'samohovets',
				contribution: 'Author',
			},
		],
		description:
			'An animated broadcast strap for live status, location, venue, and date.',
		displayName: 'Live / Location Strap',
		durationInFrames: 120,
		elementHeight: 156,
		elementWidth: 760,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		previewPadding: 260,
		slug: 'overlays/live-location-strap',
		width: 1920,
	},
	'overlays/lower-third': {
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
	},
	'text/circle-marker': {
		category: 'text',
		component: CircleMarker,
		contributors: [],
		description:
			'An animated hand-drawn circle with posterized drawing progress and shape changes.',
		displayName: 'Circle Marker',
		durationInFrames: 120,
		elementHeight: 220,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		previewPadding: 120,
		slug: 'text/circle-marker',
		width: 1920,
	},
	'text/crossed-off': {
		category: 'text',
		component: CrossedOffText,
		contributors: [],
		description:
			'An animated hand-drawn cross for removing a word or phrase with emphasis.',
		displayName: 'Crossed Off',
		durationInFrames: 120,
		elementHeight: 220,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		previewPadding: 120,
		slug: 'text/crossed-off',
		width: 1920,
	},
	'text/strike-through': {
		category: 'text',
		component: StrikeThroughText,
		contributors: [],
		description:
			'An animated hand-drawn line for striking through a word or phrase.',
		displayName: 'Strike Through',
		durationInFrames: 120,
		elementHeight: 220,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		previewPadding: 120,
		slug: 'text/strike-through',
		width: 1920,
	},
	'text/text-marker': {
		category: 'text',
		component: TextMarker,
		contributors: [],
		description:
			'A hand-drawn animated text marker for calling attention to one phrase.',
		displayName: 'Text Marker',
		durationInFrames: 120,
		elementHeight: 220,
		elementWidth: 900,
		fps: 30,
		height: 1080,
		posterFrame: 60,
		previewPadding: 120,
		slug: 'text/text-marker',
		width: 1920,
	},
} satisfies Record<string, ElementDefinition>;
