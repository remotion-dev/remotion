import {
	elementDefinitions,
	type ElementDefinition,
} from './element-definitions';

export const getElementDimensionsLabel = (definition: ElementDefinition) => {
	if (definition.elementWidth === null || definition.elementHeight === null) {
		return 'Adapts to composition';
	}

	return `${definition.elementWidth} × ${definition.elementHeight}px`;
};

export const getElementCompositionId = (slug: string) => {
	return `element-${slug.replaceAll('/', '-')}`;
};

export const getElementPreviewUrls = (definition: ElementDefinition) => {
	const base = `https://remotion.media/elements/${definition.slug}`;

	return {
		png: `${base}/preview.png`,
		video: `${base}/preview.${definition.transparentPreview ? 'webm' : 'mp4'}`,
	};
};

export const getElementDefinition = (slug: string) => {
	const definition =
		elementDefinitions[slug as keyof typeof elementDefinitions];

	if (!definition) {
		throw new Error(`No Element definition found for ${slug}`);
	}

	return definition;
};
