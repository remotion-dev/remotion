import {
	EFFECT_CATALOG,
	getEffectCatalogCategories,
} from '@remotion/studio-shared';

export const effectCategories = getEffectCatalogCategories(EFFECT_CATALOG).map(
	(category) => ({
		...category,
		headingId: category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
	}),
);
