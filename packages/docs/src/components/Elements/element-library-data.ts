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

export const getElementCategoryLabel = (category: ElementCategory) => {
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
			.sort((a, b) => compareStrings(a.displayName, b.displayName)),
		label: getElementCategoryLabel(currentCategory),
	}));
};

export const getElementDocumentationUrl = (definition: ElementDefinition) => {
	return `/elements/${definition.slug}/` as const;
};
