import {
	isComponentIdentifier,
	type ComponentDimensions,
} from './component-drag-data';

export const ELEMENT_DRAG_MIME_TYPE = 'application/vnd.remotion.element+json';

export type ElementDragData = {
	type: 'remotion-element';
	version: 1;
	element: {
		slug: string;
		displayName: string;
		componentName: string;
		fileName: string;
		sourceCode: string;
		dimensions: ComponentDimensions;
		category?: string;
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

const isCategory = (value: unknown): value is string => {
	return typeof value === 'string' && /^[a-z0-9][a-z0-9/-]*$/.test(value);
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

export const makeElementDragData = ({
	category,
	componentName,
	dimensions,
	displayName,
	fileName,
	slug,
	sourceCode,
}: ElementDragData['element']): ElementDragData => {
	return {
		type: 'remotion-element',
		version: 1,
		element: {
			slug,
			displayName,
			componentName,
			fileName,
			sourceCode,
			dimensions,
			...(category ? {category} : {}),
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

		const {
			category,
			componentName,
			dimensions,
			displayName,
			fileName,
			slug,
			sourceCode,
		} = parsed.element;

		if (
			!isSlug(slug) ||
			!isDisplayName(displayName) ||
			!isComponentIdentifier(componentName) ||
			!isLowercaseElementFileName(fileName) ||
			!isSourceCode(sourceCode) ||
			!isDimensions(dimensions) ||
			(typeof category !== 'undefined' && !isCategory(category))
		) {
			return null;
		}

		return makeElementDragData({
			slug,
			displayName,
			componentName,
			fileName,
			sourceCode,
			dimensions,
			...(category ? {category} : {}),
		});
	} catch {
		return null;
	}
};
