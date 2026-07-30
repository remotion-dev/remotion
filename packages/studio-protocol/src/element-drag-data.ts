import {
	isComponentIdentifier,
	type ComponentDimensions,
} from './component-drag-data';
import {isRecord, isValidPackageName} from './validation';

export type ElementDragData = {
	type: 'remotion-element';
	version: 1;
	element: {
		dependencies: string[];
		slug: string;
		displayName: string;
		sourceCode: string;
		dimensions: ComponentDimensions | null;
	};
};

export const isLowercaseElementFileName = (value: unknown): value is string => {
	return (
		typeof value === 'string' &&
		value.length > 0 &&
		value.length < 120 &&
		value === value.toLowerCase() &&
		value.endsWith('.tsx') &&
		!value.includes('/') &&
		!value.includes('\\') &&
		!value.includes('\0') &&
		!value.includes('..') &&
		/^[a-z0-9][a-z0-9.-]*\.tsx$/.test(value)
	);
};

const isSlug = (value: unknown): value is string => {
	return (
		typeof value === 'string' &&
		value.length > 0 &&
		value.length < 120 &&
		/^[a-z0-9][a-z0-9/-]*$/.test(value) &&
		!value.includes('..') &&
		!value.includes('//')
	);
};

export const makeElementFileNameFromSlug = (slug: string) => {
	if (!isSlug(slug)) {
		return null;
	}

	const lastSegment = slug.split('/').at(-1);
	if (!lastSegment) {
		return null;
	}

	const fileName = `${lastSegment}.element.tsx`;
	return isLowercaseElementFileName(fileName) ? fileName : null;
};

export const getElementComponentNameFromSourceCode = (sourceCode: string) => {
	const componentNames = Array.from(
		sourceCode.matchAll(
			/export\s+(?:const|function)\s+([A-Z_$][A-Za-z0-9_$]*)\b/g,
		),
	).map((match) => match[1]);
	const uniqueComponentNames = Array.from(new Set(componentNames));

	if (uniqueComponentNames.length !== 1) {
		return null;
	}

	return isComponentIdentifier(uniqueComponentNames[0])
		? uniqueComponentNames[0]
		: null;
};

export const makeElementDragData = ({
	dependencies,
	dimensions,
	displayName,
	slug,
	sourceCode,
}: ElementDragData['element']): ElementDragData => {
	return {
		type: 'remotion-element',
		version: 1,
		element: {
			dependencies: Array.from(new Set(dependencies)),
			slug,
			displayName,
			sourceCode,
			dimensions,
		},
	};
};

const isDimensions = (value: unknown): value is ComponentDimensions => {
	return (
		isRecord(value) &&
		typeof value.width === 'number' &&
		Number.isFinite(value.width) &&
		value.width > 0 &&
		typeof value.height === 'number' &&
		Number.isFinite(value.height) &&
		value.height > 0
	);
};

export const parseElementDragData = (value: string): ElementDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (
			!isRecord(parsed) ||
			parsed.type !== 'remotion-element' ||
			parsed.version !== 1 ||
			!isRecord(parsed.element)
		) {
			return null;
		}

		const {dependencies, dimensions, displayName, slug, sourceCode} =
			parsed.element;
		if (
			!isSlug(slug) ||
			typeof displayName !== 'string' ||
			displayName.length === 0 ||
			displayName.length >= 120 ||
			typeof sourceCode !== 'string' ||
			sourceCode.trim().length === 0 ||
			sourceCode.length >= 200000 ||
			getElementComponentNameFromSourceCode(sourceCode) === null ||
			makeElementFileNameFromSlug(slug) === null ||
			(dependencies !== undefined &&
				(!Array.isArray(dependencies) ||
					dependencies.length > 100 ||
					!dependencies.every(
						(dependency) =>
							typeof dependency === 'string' && isValidPackageName(dependency),
					))) ||
			(dimensions !== undefined &&
				dimensions !== null &&
				!isDimensions(dimensions))
		) {
			return null;
		}

		return makeElementDragData({
			dependencies: dependencies ?? [],
			slug,
			displayName,
			sourceCode,
			dimensions: dimensions ?? null,
		});
	} catch {
		return null;
	}
};
