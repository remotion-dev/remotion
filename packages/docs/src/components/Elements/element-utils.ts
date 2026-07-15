import {elementDefinitions} from './element-definitions';

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
