import type {ElementDefinition} from './element-definitions';

export const ELEMENT_OG_FALLBACK_IMAGE = '/img/social-preview.png';

export type ElementOgMetadata = {
	readonly durationSeconds: number | null;
	readonly height: number | null;
	readonly imageUrl: string;
	readonly videoUrl: string | null;
	readonly width: number | null;
};

export const getElementPreviewUrls = (slug: string) => {
	const base = `https://remotion.media/elements/${slug}`;

	return {
		mp4: `${base}/preview.mp4`,
		png: `${base}/preview.png`,
	};
};

export const getElementOgMetadata = ({
	definition,
	previewDimensions,
}: {
	readonly definition: ElementDefinition;
	readonly previewDimensions: {readonly height: number; readonly width: number};
}): ElementOgMetadata => {
	if (definition.hasPreviewAssets === false) {
		return {
			durationSeconds: null,
			height: null,
			imageUrl: ELEMENT_OG_FALLBACK_IMAGE,
			videoUrl: null,
			width: null,
		};
	}

	const urls = getElementPreviewUrls(definition.slug);

	return {
		durationSeconds: definition.durationInFrames / definition.fps,
		height: previewDimensions.height,
		imageUrl: urls.png,
		videoUrl: urls.mp4,
		width: previewDimensions.width,
	};
};
