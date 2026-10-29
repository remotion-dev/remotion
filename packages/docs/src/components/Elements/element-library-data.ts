import {
	elementDefinitions,
	type ElementDefinition,
} from './element-definitions';
import {elementCategories as registeredCategories} from './element-registry';

type RegisteredElementDefinition = (typeof elementDefinitions)[number];

export type ElementCategory = RegisteredElementDefinition['category'];

export type ElementLibrarySection = {
	readonly category: ElementCategory;
	readonly definitions: readonly ElementDefinition[];
	readonly label: string;
};

// Use the sidebar's category order for the gallery as well.
const elementCategories = registeredCategories
	.map(({category}) => category)
	.filter((category) =>
		elementDefinitions.some((definition) => definition.category === category),
	);

export const getElementCategoryLabel = (category: ElementCategory) => {
	return (
		registeredCategories.find((entry) => entry.category === category)?.label ??
		category
	);
};

export {getElementCategoryHeadingId} from './element-registry';

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
