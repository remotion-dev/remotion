import {describe, expect, test} from 'bun:test';
import type {ElementDefinition} from '../components/Elements/element-definitions';
import {
	ELEMENT_OG_FALLBACK_IMAGE,
	getElementOgMetadata,
} from '../components/Elements/element-og';
import {Seo} from '../components/Seo';

const mockDefinition = {
	category: 'overlays',
	component: (() => null) as ElementDefinition['component'],
	contributors: [],
	description: 'A clean animated lower third.',
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
} satisfies ElementDefinition;

describe('Element OG metadata', () => {
	test('resolves OG image and video metadata from Element preview assets', () => {
		const previewDimensions = {height: 738, width: 1280};
		const og = getElementOgMetadata({
			definition: mockDefinition,
			previewDimensions,
		});
		const siteUrl = 'https://www.remotion.dev';

		expect(og).toEqual({
			durationSeconds: 4,
			height: 738,
			imageUrl:
				'https://remotion.media/elements/overlays/lower-third/preview.png',
			videoUrl:
				'https://remotion.media/elements/overlays/lower-third/preview.mp4',
			width: 1280,
		});

		const imageTags = Seo.renderImage(og.imageUrl, siteUrl, {
			height: og.height!,
			width: og.width!,
		});
		expect(imageTags).toHaveLength(4);
		expect(imageTags[0].props).toMatchObject({
			property: 'og:image',
			content:
				'https://remotion.media/elements/overlays/lower-third/preview.png',
		});
		expect(imageTags[1].props).toMatchObject({
			name: 'twitter:image',
			content:
				'https://remotion.media/elements/overlays/lower-third/preview.png',
		});
		expect(imageTags[2].props).toMatchObject({
			property: 'og:image:width',
			content: '1280',
		});
		expect(imageTags[3].props).toMatchObject({
			property: 'og:image:height',
			content: '738',
		});

		const videoTags = Seo.renderVideo({
			src: og.videoUrl!,
			domain: siteUrl,
			width: og.width!,
			height: og.height!,
			durationSeconds: og.durationSeconds ?? undefined,
		});
		expect(videoTags).toHaveLength(6);
		expect(videoTags[0].props).toMatchObject({
			property: 'og:video',
			content:
				'https://remotion.media/elements/overlays/lower-third/preview.mp4',
		});
		expect(videoTags[2].props).toMatchObject({
			property: 'og:video:type',
			content: 'video/mp4',
		});
		expect(videoTags[3].props).toMatchObject({
			property: 'og:video:width',
			content: '1280',
		});
		expect(videoTags[4].props).toMatchObject({
			property: 'og:video:height',
			content: '738',
		});
		expect(videoTags[5].props).toMatchObject({
			property: 'og:video:duration',
			content: '4',
		});
	});

	test('falls back to the site social preview when an Element has no dedicated assets', () => {
		const definition = {
			...mockDefinition,
			hasPreviewAssets: false,
		};
		const og = getElementOgMetadata({
			definition,
			previewDimensions: {height: 738, width: 1280},
		});
		const siteUrl = 'https://www.remotion.dev';

		expect(og).toEqual({
			durationSeconds: null,
			height: null,
			imageUrl: ELEMENT_OG_FALLBACK_IMAGE,
			videoUrl: null,
			width: null,
		});

		const imageTags = Seo.renderImage(og.imageUrl, siteUrl);
		expect(imageTags).toHaveLength(2);
		expect(imageTags[0].props).toMatchObject({
			property: 'og:image',
			content: 'https://www.remotion.dev/img/social-preview.png',
		});
		expect(imageTags[1].props).toMatchObject({
			name: 'twitter:image',
			content: 'https://www.remotion.dev/img/social-preview.png',
		});
	});
});
