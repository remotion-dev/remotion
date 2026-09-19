import * as z from 'zod/mini';
import {
	isComponentIdentifier,
	type ComponentDimensions,
} from './component-drag-data';
import {isValidPackageName} from './validation';

export type ElementInstallationMode = 'wrapped' | 'component-owned-sequence';

const maxElementAssets = 100;
export const maxElementAssetBytes = 50 * 1024 * 1024;

export type ElementAsset =
	| {
			readonly path: string;
			readonly type: 'url';
			readonly url: string;
	  }
	| {
			readonly path: string;
			readonly type: 'base64';
			readonly data: string;
	  };

export type ElementInitialPropValue =
	| string
	| number
	| boolean
	| null
	| readonly ElementInitialPropValue[]
	| Readonly<object>;

export type ElementInitialProps = Readonly<
	Record<string, ElementInitialPropValue>
>;

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
	version: 1 | 2;
	element: {
		assets: ElementAsset[];
		dependencies: ElementDependency[];
		durationInFrames?: number;
		initialProps: ElementInitialProps | null;
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

const windowsReservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
const strictBase64Regex =
	/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const isValidElementAssetPath = (assetPath: string) =>
	assetPath.length > 0 &&
	assetPath.length <= 1024 &&
	!assetPath.startsWith('/') &&
	!assetPath.includes('\\') &&
	assetPath
		.split('/')
		.every(
			(segment) =>
				segment !== '' &&
				segment !== '.' &&
				segment !== '..' &&
				!/[<>:"|?*]/.test(segment) &&
				!Array.from(segment).some(
					(character) => character.charCodeAt(0) <= 31,
				) &&
				!/[. ]$/.test(segment) &&
				!windowsReservedNames.test(segment),
		);

const isValidElementAssetUrl = (value: string) => {
	try {
		const url = new URL(value);
		return (
			(url.protocol === 'http:' || url.protocol === 'https:') &&
			url.username === '' &&
			url.password === ''
		);
	} catch {
		return false;
	}
};

const getStrictBase64DecodedLength = (data: string): number | null =>
	data.length % 4 === 0 && strictBase64Regex.test(data)
		? (data.length / 4) * 3 -
			(data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0)
		: null;

const elementAssetSchema = z.union([
	z.strictObject({
		path: z.string().check(z.refine(isValidElementAssetPath)),
		type: z.literal('url'),
		url: z.string().check(z.refine(isValidElementAssetUrl)),
	}),
	z.strictObject({
		path: z.string().check(z.refine(isValidElementAssetPath)),
		type: z.literal('base64'),
		data: z.string().check(z.regex(strictBase64Regex)),
	}),
]);
const elementAssetsSchema = z
	.array(elementAssetSchema)
	.check(z.maxLength(maxElementAssets));

export const decodeElementAssetData = (data: string): Uint8Array =>
	Uint8Array.from(atob(data), (character) => character.charCodeAt(0));

export function assertElementAssets(
	value: unknown,
): asserts value is ElementAsset[] {
	const parsed = z.safeParse(elementAssetsSchema, value);
	if (!parsed.success) {
		throw new TypeError('Invalid Element assets');
	}

	const paths = new Set<string>();
	let embeddedBytes = 0;
	for (const asset of parsed.data) {
		const assetPath = asset.path.toLowerCase();
		if (
			[...paths].some(
				(existingPath) =>
					existingPath === assetPath ||
					existingPath.startsWith(`${assetPath}/`) ||
					assetPath.startsWith(`${existingPath}/`),
			)
		) {
			throw new TypeError(
				`Element asset destination conflicts with another asset: ${asset.path}`,
			);
		}

		paths.add(assetPath);
		if (asset.type === 'base64') {
			embeddedBytes += getStrictBase64DecodedLength(asset.data) as number;
		}
	}

	if (embeddedBytes > maxElementAssetBytes) {
		throw new TypeError('Element assets exceed the 50MB aggregate limit');
	}
}

export const makeElementDragData = ({
	assets,
	dependencies,
	dimensions,
	displayName,
	durationInFrames,
	initialProps,
	slug,
	sourceCode,
	installationMode,
}: Omit<ElementDragData['element'], 'dependencies'> & {
	dependencies: ElementDependency[];
}): ElementDragData => {
	assertElementAssets(assets);
	for (const dependency of dependencies) {
		assertElementDependency(dependency);
	}

	return {
		type: 'remotion-element',
		version: assets.length === 0 ? 1 : 2,
		element: {
			assets: [...assets],
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
			initialProps,
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
const elementInitialPropsSchema = z.record(z.string(), z.unknown());
const initialPropNameRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;
const componentOwnedInstallationProps = new Set([
	'durationInFrames',
	'from',
	'name',
]);

const isJsonCompatibleValue = (
	value: unknown,
	seen: Set<object>,
): value is ElementInitialPropValue => {
	if (
		value === null ||
		typeof value === 'string' ||
		typeof value === 'boolean'
	) {
		return true;
	}

	if (typeof value === 'number') {
		return Number.isFinite(value);
	}

	if (typeof value !== 'object' || seen.has(value)) {
		return false;
	}

	seen.add(value);
	const valid = Array.isArray(value)
		? value.every((item) => isJsonCompatibleValue(item, seen))
		: Object.getPrototypeOf(value) === Object.prototype &&
			Object.values(value).every((item) => isJsonCompatibleValue(item, seen));
	seen.delete(value);
	return valid;
};

export const isElementInitialProps = (
	value: unknown,
): value is ElementInitialProps | null =>
	value === null ||
	(!Array.isArray(value) &&
		typeof value === 'object' &&
		value !== null &&
		Object.keys(value).every((key) => initialPropNameRegex.test(key)) &&
		isJsonCompatibleValue(value, new Set()));

export const hasValidElementInitialPropsForInstallationMode = ({
	initialProps,
	installationMode,
}: {
	initialProps: ElementInitialProps | null;
	installationMode: ElementInstallationMode | undefined;
}) => {
	if (
		installationMode !== 'component-owned-sequence' ||
		initialProps === null
	) {
		return true;
	}

	if (
		Object.keys(initialProps).some((name) =>
			componentOwnedInstallationProps.has(name),
		)
	) {
		return false;
	}

	return (
		initialProps.style === undefined ||
		(initialProps.style !== null &&
			typeof initialProps.style === 'object' &&
			!Array.isArray(initialProps.style))
	);
};

const elementDragDataSchema = z.object({
	type: z.literal('remotion-element'),
	version: z.union([z.literal(1), z.literal(2)]),
	element: z.object({
		assets: z.optional(z.array(z.unknown())),
		dependencies: z.array(z.unknown()).check(z.maxLength(100)),
		durationInFrames: z.optional(durationSchema),
		initialProps: z.optional(z.nullable(elementInitialPropsSchema)),
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

		const assets = parsed.data.element.assets ?? [];
		try {
			assertElementAssets(assets);
		} catch {
			return null;
		}

		const dependencies: ElementDependency[] = [];
		for (const dependency of parsed.data.element.dependencies) {
			if (!isElementDependency(dependency)) {
				return null;
			}

			dependencies.push(dependency);
		}

		const initialProps = parsed.data.element.initialProps ?? null;
		if (
			!isElementInitialProps(initialProps) ||
			!hasValidElementInitialPropsForInstallationMode({
				initialProps,
				installationMode: parsed.data.element.installationMode,
			})
		) {
			return null;
		}

		const result = makeElementDragData({
			assets,
			dependencies,
			dimensions: parsed.data.element.dimensions ?? null,
			displayName: parsed.data.element.displayName,
			durationInFrames: parsed.data.element.durationInFrames,
			initialProps,
			slug: parsed.data.element.slug,
			sourceCode: parsed.data.element.sourceCode,
			installationMode: parsed.data.element.installationMode,
		});
		return result.version === parsed.data.version ? result : null;
	} catch {
		return null;
	}
};
