import {
	elementDefinitions,
	type ElementDefinition,
} from './element-definitions';

type RegisteredElementDefinition = (typeof elementDefinitions)[number];

export type ElementCategory = RegisteredElementDefinition['category'];

export type ElementLibrarySection = {
	readonly category: ElementCategory;
	readonly definitions: readonly ElementDefinition[];
	readonly label: string;
};

const elementCategories = Array.from(
	new Set(elementDefinitions.map(({category}) => category)),
);

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

	return categories.map((currentCategory) => ({
		category: currentCategory,
		definitions: elementDefinitions.filter(
			(definition) => definition.category === currentCategory,
		),
		label: getElementCategoryLabel(currentCategory),
	}));
};

export const getElementDocumentationUrl = (definition: ElementDefinition) => {
	return `/elements/${definition.slug}/` as const;
};
