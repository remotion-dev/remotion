import {
	elementDefinitions,
	type ElementDefinition,
} from './element-definitions';

export const getElementWidthLabel = (definition: ElementDefinition) => {
	if (definition.elementWidth === null) {
		return 'Adapts to composition';
	}

	return `${definition.elementWidth}px`;
};

export const getElementHeightLabel = (definition: ElementDefinition) => {
	if (definition.elementHeight === null) {
		return 'Adapts to composition';
	}

	return `${definition.elementHeight}px`;
};

export const getElementDimensionsLabel = (definition: ElementDefinition) => {
	if (definition.elementWidth === null || definition.elementHeight === null) {
		return 'Adapts to composition';
	}

	return `${definition.elementWidth} × ${definition.elementHeight}px`;
};

export const getElementDurationLabel = (definition: ElementDefinition) => {
	if (definition.elementDurationInFrames === null) {
		return 'Adapts to composition';
	}

	const seconds = definition.elementDurationInFrames / definition.fps;
	const secondsLabel = Number.isInteger(seconds)
		? `${seconds}s`
		: `${seconds.toFixed(2)}s`;

	return `${definition.elementDurationInFrames} frames (${secondsLabel} at ${definition.fps}fps)`;
};

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
	const definition =
		elementDefinitions[slug as keyof typeof elementDefinitions];

	if (!definition) {
		throw new Error(`No Element definition found for ${slug}`);
	}

	return definition;
};
