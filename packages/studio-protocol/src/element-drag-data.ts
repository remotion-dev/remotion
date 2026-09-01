import * as z from 'zod/mini';
import {
	isComponentIdentifier,
	type ComponentDimensions,
} from './component-drag-data';
import {isValidPackageName} from './validation';

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

const lowercaseElementFileNameSchema = z
	.string()
	.check(
		z.refine(
			(value) =>
				value.length > 0 &&
				value.length < 120 &&
				value === value.toLowerCase() &&
				value.endsWith('.tsx') &&
				!value.includes('/') &&
				!value.includes('\\') &&
				!value.includes('\0') &&
				!value.includes('..') &&
				/^[a-z0-9][a-z0-9.-]*\.tsx$/.test(value),
		),
	);
const slugSchema = z
	.string()
	.check(
		z.refine(
			(value) =>
				value.length > 0 &&
				value.length < 120 &&
				/^[a-z0-9][a-z0-9/-]*$/.test(value) &&
				!value.includes('..') &&
				!value.includes('//'),
		),
	);

export const isLowercaseElementFileName = (value: unknown): value is string =>
	z.safeParse(lowercaseElementFileNameSchema, value).success;

const isSlug = (value: unknown): value is string =>
	z.safeParse(slugSchema, value).success;

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

const exactVersionSchema = z
	.string()
	.check(
		z.regex(
			/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
		),
	);
const elementDependencyEnvelopeSchema = z.looseObject({
	name: z.string().check(z.refine(isValidPackageName)),
	version: z.unknown(),
});

const getElementDependencyError = (value: unknown): string | null => {
	const parsed = z.safeParse(elementDependencyEnvelopeSchema, value);
	if (!parsed.success) {
		return `Invalid Element dependency: ${JSON.stringify(value)}`;
	}

	if (packagesProvidedByRemotionProjects.has(parsed.data.name)) {
		return `${JSON.stringify(parsed.data.name)} is provided by Remotion projects and must not be declared as an Element dependency.`;
	}

	if (parsed.data.name.startsWith('@remotion/')) {
		return parsed.data.version === null
			? null
			: `Remotion Element dependency ${JSON.stringify(parsed.data.name)} must use version: null.`;
	}

	return z.safeParse(exactVersionSchema, parsed.data.version).success
		? null
		: `Non-Remotion Element dependency ${JSON.stringify(parsed.data.name)} must declare an exact version.`;
};

const elementDependencySchema = elementDependencyEnvelopeSchema.check(
	z.refine((value) => getElementDependencyError(value) === null),
);

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
): value is ElementDependency =>
	z.safeParse(elementDependencySchema, value).success;

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

const dimensionsSchema = z.object({
	width: z.number().check(z.positive()),
	height: z.number().check(z.positive()),
});
const elementInstallationModeSchema = z.union([
	z.literal('wrapped'),
	z.literal('component-owned-sequence'),
]);
const durationSchema = z
	.number()
	.check(z.int(), z.positive(), z.lte(100_000_000));
const elementDragDataSchema = z.object({
	type: z.literal('remotion-element'),
	version: z.literal(1),
	element: z.object({
		dependencies: z.array(z.unknown()).check(z.maxLength(100)),
		durationInFrames: z.optional(durationSchema),
		installationMode: z.optional(elementInstallationModeSchema),
		slug: slugSchema,
		displayName: z.string().check(z.minLength(1), z.maxLength(119)),
		sourceCode: z
			.string()
			.check(
				z.refine(
					(value) =>
						value.trim().length > 0 &&
						value.length < 200_000 &&
						getElementComponentNameFromSourceCode(value) !== null,
				),
			),
		dimensions: z.optional(z.nullable(dimensionsSchema)),
	}),
});

export const parseElementDragData = (value: string): ElementDragData | null => {
	try {
		const parsed = z.safeParse(elementDragDataSchema, JSON.parse(value));
		if (
			!parsed.success ||
			makeElementFileNameFromSlug(parsed.data.element.slug) === null
		) {
			return null;
		}

		const dependencies: ElementDependency[] = [];
		for (const dependency of parsed.data.element.dependencies) {
			if (!isElementDependency(dependency)) {
				return null;
			}

			dependencies.push(dependency);
		}

		return makeElementDragData({
			dependencies,
			dimensions: parsed.data.element.dimensions ?? null,
			displayName: parsed.data.element.displayName,
			durationInFrames: parsed.data.element.durationInFrames,
			slug: parsed.data.element.slug,
			sourceCode: parsed.data.element.sourceCode,
			installationMode: parsed.data.element.installationMode,
		});
	} catch {
		return null;
	}
};
