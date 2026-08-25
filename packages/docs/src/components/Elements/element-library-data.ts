import {
	elementDefinitions,
	type ElementDefinition,
} from './element-definitions';

type RegisteredElementDefinition =
	(typeof elementDefinitions)[keyof typeof elementDefinitions];

export type ElementCategory = RegisteredElementDefinition['category'];

export type ElementLibrarySection = {
	readonly category: ElementCategory;
	readonly definitions: readonly ElementDefinition[];
	readonly label: string;
};

const compareStrings = (a: string, b: string) => {
	if (a < b) {
		return -1;
	}

	if (a > b) {
		return 1;
	}

	return 0;
};

const elementCategories = Array.from(
	new Set(Object.values(elementDefinitions).map(({category}) => category)),
).sort(compareStrings) as ElementCategory[];

const backgroundOrder: Record<string, number> = {
	'backgrounds/notebook-paper': 0,
	'backgrounds/paper-texture': 1,
	'backgrounds/rotating-starburst': 2,
	'backgrounds/liquid-contours': 3,
};

export const getElementCategoryLabel = (category: ElementCategory) => {
	if (category === 'youtube') {
		return 'YouTube';
	}

	return category
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
};

export const isElementCategory = (
	category: string,
): category is ElementCategory => {
	return (elementCategories as readonly string[]).includes(category);
};

export const getElementLibrarySections = (
	category: ElementCategory | null,
): readonly ElementLibrarySection[] => {
	const categories = category === null ? elementCategories : [category];
	const definitions = Object.values(elementDefinitions);

	return categories.map((currentCategory) => ({
		category: currentCategory,
		definitions: definitions
			.filter((definition) => definition.category === currentCategory)
			.sort((a, b) => {
				if (currentCategory === 'backgrounds') {
					const orderDifference =
						(backgroundOrder[a.slug] ?? Number.MAX_SAFE_INTEGER) -
						(backgroundOrder[b.slug] ?? Number.MAX_SAFE_INTEGER);
					if (orderDifference !== 0) {
						return orderDifference;
					}
				}

				return compareStrings(a.displayName, b.displayName);
			}),
		label: getElementCategoryLabel(currentCategory),
	}));
};

export const getElementDocumentationUrl = (definition: ElementDefinition) => {
	return `/elements/${definition.slug}/` as const;
};
