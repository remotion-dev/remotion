import {
	isComponentIdentifier,
	type ComponentDimensions,
} from './component-drag-data';
import {isRecord, isValidPackageName} from './validation';

export type ElementInstallationMode = 'wrapped' | 'component-owned-sequence';

export type ElementDependency =
	| {
			readonly name: `@remotion/${string}`;
			readonly version: null;
	  }
	| {
			readonly name: string;
			readonly version: string;
	  };

export type ElementDragData = {
	type: 'remotion-element';
	version: 1;
	element: {
		dependencies: ElementDependency[];
		durationInFrames?: number;
		installationMode?: ElementInstallationMode;
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
	if (!isSlug(slug)) return null;
	const lastSegment = slug.split('/').at(-1);
	if (!lastSegment) return null;
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
	if (uniqueComponentNames.length !== 1) return null;
	return isComponentIdentifier(uniqueComponentNames[0])
		? uniqueComponentNames[0]
		: null;
};

const packagesProvidedByRemotionProjects = new Set([
	'react',
	'react-dom',
	'remotion',
]);

const isExactVersion = (value: unknown): value is string =>
	typeof value === 'string' &&
	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(
		value,
	);

const getElementDependencyError = (value: unknown): string | null => {
	if (
		!isRecord(value) ||
		typeof value.name !== 'string' ||
		!isValidPackageName(value.name)
	) {
		return `Invalid Element dependency: ${JSON.stringify(value)}`;
	}

	if (packagesProvidedByRemotionProjects.has(value.name)) {
		return `${JSON.stringify(value.name)} is provided by Remotion projects and must not be declared as an Element dependency.`;
	}

	if (value.name.startsWith('@remotion/')) {
		return value.version === null
			? null
			: `Remotion Element dependency ${JSON.stringify(value.name)} must use version: null.`;
	}

	return isExactVersion(value.version)
		? null
		: `Non-Remotion Element dependency ${JSON.stringify(value.name)} must declare an exact version.`;
};

export function assertElementDependency(
	value: unknown,
): asserts value is ElementDependency {
	const error = getElementDependencyError(value);
	if (error !== null) {
		throw new TypeError(error);
	}
}

export const isElementDependency = (
	value: unknown,
): value is ElementDependency => getElementDependencyError(value) === null;

export const makeElementDragData = ({
	dependencies,
	dimensions,
	displayName,
	durationInFrames,
	slug,
	sourceCode,
	installationMode,
}: Omit<ElementDragData['element'], 'dependencies'> & {
	dependencies: ElementDependency[];
}): ElementDragData => {
	for (const dependency of dependencies) {
		assertElementDependency(dependency);
	}

	return {
		type: 'remotion-element',
		version: 1,
		element: {
			dependencies: Array.from(
				new Map(
					dependencies.map(
						(dependency) => [dependency.name, dependency] as const,
					),
				).values(),
			),
			dimensions,
			displayName,
			...(durationInFrames === undefined ? {} : {durationInFrames}),
			...(installationMode === undefined ? {} : {installationMode}),
			slug,
			sourceCode,
		},
	};
};

const isDimensions = (value: unknown): value is ComponentDimensions =>
	isRecord(value) &&
	typeof value.width === 'number' &&
	Number.isFinite(value.width) &&
	value.width > 0 &&
	typeof value.height === 'number' &&
	Number.isFinite(value.height) &&
	value.height > 0;

const isElementInstallationMode = (
	value: unknown,
): value is ElementInstallationMode =>
	value === 'wrapped' || value === 'component-owned-sequence';

const isDuration = (value: unknown): value is number =>
	typeof value === 'number' &&
	Number.isInteger(value) &&
	value > 0 &&
	value <= 100_000_000;

export const parseElementDragData = (value: string): ElementDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (
			!isRecord(parsed) ||
			parsed.type !== 'remotion-element' ||
			parsed.version !== 1 ||
			!isRecord(parsed.element)
		)
			return null;
		const {
			dependencies,
			dimensions,
			displayName,
			durationInFrames,
			slug,
			sourceCode,
			installationMode,
		} = parsed.element;
		const validDependencies =
			Array.isArray(dependencies) && dependencies.length <= 100
				? dependencies
				: null;
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
			validDependencies === null ||
			!validDependencies.every(isElementDependency) ||
			(durationInFrames !== undefined && !isDuration(durationInFrames)) ||
			(installationMode !== undefined &&
				!isElementInstallationMode(installationMode)) ||
			(dimensions !== undefined &&
				dimensions !== null &&
				!isDimensions(dimensions))
		)
			return null;
		return makeElementDragData({
			dependencies: validDependencies,
			dimensions: dimensions ?? null,
			displayName,
			durationInFrames,
			slug,
			sourceCode,
			installationMode,
		});
	} catch {
		return null;
	}
};
