import {
	isComponentIdentifier,
	type ComponentDimensions,
} from './component-drag-data';

export {ELEMENT_DRAG_MIME_TYPE} from './drag-mime-types';

export type ElementDragData = {
	type: 'remotion-element';
	version: 1;
	element: {
		slug: string;
		displayName: string;
		sourceCode: string;
		dimensions: ComponentDimensions | null;
	};
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
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

const isDisplayName = (value: unknown): value is string => {
	return typeof value === 'string' && value.length > 0 && value.length < 120;
};

const isSourceCode = (value: unknown): value is string => {
	return (
		typeof value === 'string' &&
		value.trim().length > 0 &&
		value.length < 200000
	);
};

const isDimensions = (value: unknown): value is ComponentDimensions => {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.width === 'number' &&
		Number.isFinite(value.width) &&
		value.width > 0 &&
		typeof value.height === 'number' &&
		Number.isFinite(value.height) &&
		value.height > 0
	);
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

	const [componentName] = uniqueComponentNames;
	return isComponentIdentifier(componentName) ? componentName : null;
};

export const makeElementDragData = ({
	dimensions,
	displayName,
	slug,
	sourceCode,
}: ElementDragData['element']): ElementDragData => {
	return {
		type: 'remotion-element',
		version: 1,
		element: {
			slug,
			displayName,
			sourceCode,
			dimensions,
		},
	};
};

export const parseElementDragData = (value: string): ElementDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed)) {
			return null;
		}

		if (parsed.type !== 'remotion-element' || parsed.version !== 1) {
			return null;
		}

		if (!isRecord(parsed.element)) {
			return null;
		}

		const {dimensions, displayName, slug, sourceCode} = parsed.element;

		if (
			!isSlug(slug) ||
			!isDisplayName(displayName) ||
			!isSourceCode(sourceCode) ||
			getElementComponentNameFromSourceCode(sourceCode) === null ||
			makeElementFileNameFromSlug(slug) === null ||
			(dimensions !== undefined &&
				dimensions !== null &&
				!isDimensions(dimensions))
		) {
			return null;
		}

		return makeElementDragData({
			slug,
			displayName,
			sourceCode,
			dimensions: dimensions ?? null,
		});
	} catch {
		return null;
	}
};
