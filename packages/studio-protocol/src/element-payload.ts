import * as z from 'zod/mini';
import type {ComponentDimensions} from './component-drag-data';
import {makeDragData} from './drag-data';
import {
	assertElementDependency,
	getElementComponentNameFromSourceCode,
	hasValidElementInitialPropsForInstallationMode,
	isElementInitialProps,
	makeElementFileNameFromSlug,
	parseElementDragData,
	type ElementAsset,
	type ElementDependency,
	type ElementDragData,
	type ElementInitialProps,
	type ElementInstallationMode,
} from './element-drag-data';

const MAX_PAYLOAD_SIZE = 250_000;
const MAX_SOURCE_CODE_SIZE = 200_000;
const MAX_DEPENDENCIES = 100;

export type CreateElementPayloadInput = {
	readonly assets?: readonly ElementAsset[];
	readonly displayName: string;
	readonly slug: string;
	readonly sourceCode: string;
	readonly dependencies: readonly ElementDependency[];
	readonly dimensions: ComponentDimensions | null;
	readonly durationInFrames: number;
	readonly initialProps?: ElementInitialProps | null;
	readonly installationMode?: ElementInstallationMode;
	readonly isCaptionStyle?: boolean;
};

export type StudioElementPayload = ElementDragData & {
	readonly durationInFrames: number;
};

const durationSchema = z.int().check(z.positive(), z.lte(100_000_000));

const studioElementPayloadEnvelopeSchema = z.object({
	type: z.literal('remotion-element'),
	version: z.union([z.literal(1), z.literal(2)]),
	durationInFrames: durationSchema,
	element: z.unknown(),
});

const displayNameSchema = z.string().check(z.minLength(1));

const sourceCodeSchema = z
	.string()
	.check(z.refine((value) => value.trim().length > 0));

const installationModeSchema = z.optional(
	z.enum(['wrapped', 'component-owned-sequence']),
);

const captionStyleSchema = z.optional(z.boolean());

const assertCreateElementPayloadInput = (
	input: CreateElementPayloadInput,
): void => {
	if (!z.safeParse(displayNameSchema, input.displayName).success) {
		throw new TypeError('displayName must be a non-empty string');
	}

	if (input.displayName.length >= 120) {
		throw new TypeError('displayName must be shorter than 120 characters');
	}

	if (makeElementFileNameFromSlug(input.slug) === null) {
		throw new TypeError('slug must be a safe lowercase Element slug');
	}

	if (!z.safeParse(sourceCodeSchema, input.sourceCode).success) {
		throw new TypeError('sourceCode must be a non-empty string');
	}

	if (input.sourceCode.length >= MAX_SOURCE_CODE_SIZE) {
		throw new TypeError(
			`sourceCode must be shorter than ${MAX_SOURCE_CODE_SIZE} characters`,
		);
	}

	if (getElementComponentNameFromSourceCode(input.sourceCode) === null) {
		throw new TypeError(
			'sourceCode must contain exactly one exported named React component',
		);
	}

	if (!Array.isArray(input.dependencies)) {
		throw new TypeError('dependencies must be an array');
	}

	if (input.dependencies.length > MAX_DEPENDENCIES) {
		throw new TypeError(
			`dependencies must contain at most ${MAX_DEPENDENCIES} packages`,
		);
	}

	for (const dependency of input.dependencies) {
		assertElementDependency(dependency);
	}

	if (!z.safeParse(durationSchema, input.durationInFrames).success) {
		throw new TypeError(
			'durationInFrames must be an integer between 1 and 100000000',
		);
	}

	if (!z.safeParse(installationModeSchema, input.installationMode).success) {
		throw new TypeError(
			'installationMode must be "wrapped" or "component-owned-sequence"',
		);
	}

	if (!z.safeParse(captionStyleSchema, input.isCaptionStyle).success) {
		throw new TypeError('isCaptionStyle must be a boolean');
	}

	if (
		input.isCaptionStyle &&
		input.installationMode !== 'component-owned-sequence'
	) {
		throw new TypeError(
			'Caption styles must use component-owned-sequence installation',
		);
	}

	const initialProps = input.initialProps ?? null;

	if (!isElementInitialProps(initialProps)) {
		throw new TypeError(
			'initialProps must be null or an object containing JSON-compatible values with valid JSX attribute names',
		);
	}

	if (
		!hasValidElementInitialPropsForInstallationMode({
			initialProps,
			installationMode: input.installationMode,
		})
	) {
		throw new TypeError(
			'component-owned-sequence initialProps must not define from, durationInFrames, or name, and style must be an object when provided',
		);
	}
};

export const createElementPayload = (
	input: CreateElementPayloadInput,
): StudioElementPayload => {
	assertCreateElementPayloadInput(input);

	const constructed = makeDragData({
		type: 'element',
		assets: [...(input.assets ?? [])],
		dependencies: [...input.dependencies],
		dimensions: input.dimensions,
		displayName: input.displayName,
		durationInFrames: input.durationInFrames,
		initialProps: input.initialProps ?? null,
		slug: input.slug,
		sourceCode: input.sourceCode,
		installationMode: input.installationMode ?? 'wrapped',
		isCaptionStyle: input.isCaptionStyle,
	});

	const payload: StudioElementPayload = {
		...constructed.data,
		durationInFrames: input.durationInFrames,
	};

	if (JSON.stringify(payload).length > MAX_PAYLOAD_SIZE) {
		throw new TypeError(
			`The Element payload must be smaller than ${MAX_PAYLOAD_SIZE} characters`,
		);
	}

	return payload;
};

export const parseStudioElementPayload = (
	value: unknown,
): StudioElementPayload | null => {
	const parsed = z.safeParse(studioElementPayloadEnvelopeSchema, value);

	if (!parsed.success) {
		return null;
	}

	if (
		typeof parsed.data.element !== 'object' ||
		parsed.data.element === null ||
		Array.isArray(parsed.data.element)
	) {
		return null;
	}

	const rawInitialProps =
		Object.hasOwn(parsed.data.element, 'initialProps') &&
		'initialProps' in parsed.data.element
			? parsed.data.element.initialProps
			: null;

	if (!isElementInitialProps(rawInitialProps)) {
		return null;
	}

	let serializedElement: string;

	try {
		serializedElement = JSON.stringify({
			type: parsed.data.type,
			version: parsed.data.version,
			element: parsed.data.element,
		});
	} catch {
		return null;
	}

	const element = parseElementDragData(serializedElement);

	if (element === null) {
		return null;
	}

	const payload: StudioElementPayload = {
		...element,
		element: {
			...element.element,
			durationInFrames: parsed.data.durationInFrames,
		},
		durationInFrames: parsed.data.durationInFrames,
	};

	return JSON.stringify(payload).length <= MAX_PAYLOAD_SIZE ? payload : null;
};
