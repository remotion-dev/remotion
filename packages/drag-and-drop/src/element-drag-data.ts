import {
	isComponentIdentifier,
	type ComponentDimensions,
} from './component-drag-data';
import {
	parseDragPreviewMetadataValue,
	type ElementDragPreviewMetadata,
} from './drag-preview-metadata';
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
	preview: ElementDragPreviewMetadata;
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
	durationInFrames,
	slug,
	sourceCode,
}: ElementDragData['element'] & {
	readonly durationInFrames?: number;
}): ElementDragData => {
	const preview = parseDragPreviewMetadataValue({
		kind: 'element',
		...(dimensions ?? {}),
		...(durationInFrames === undefined ? {} : {durationInFrames}),
	});
	if (preview === null || preview.kind !== 'element') {
		throw new TypeError('Invalid element drag preview metadata');
	}

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
		preview,
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

		const preview =
			parsed.preview === undefined
				? {kind: 'element' as const}
				: parseDragPreviewMetadataValue(parsed.preview);
		if (preview === null || preview.kind !== 'element') {
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
			durationInFrames: preview.durationInFrames,
		});
	} catch {
		return null;
	}
};
