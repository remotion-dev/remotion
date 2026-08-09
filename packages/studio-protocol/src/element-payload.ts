import type {ComponentDimensions} from './component-drag-data';
import {makeDragData} from './drag-data';
import {
	assertElementDependency,
	getElementComponentNameFromSourceCode,
	makeElementFileNameFromSlug,
	parseElementDragData,
	type ElementDependency,
	type ElementDragData,
	type ElementInstallationMode,
} from './element-drag-data';
import {isRecord} from './validation';

const MAX_PAYLOAD_SIZE = 250_000;
const MAX_SOURCE_CODE_SIZE = 200_000;
const MAX_DEPENDENCIES = 100;

export type CreateElementPayloadInput = {
	readonly displayName: string;
	readonly slug: string;
	readonly sourceCode: string;
	readonly dependencies: readonly ElementDependency[];
	readonly dimensions: ComponentDimensions | null;
	readonly durationInFrames: number;
	readonly installationMode?: ElementInstallationMode;
};

export type StudioElementPayload = ElementDragData & {
	readonly durationInFrames: number;
};

const isDuration = (value: unknown): value is number =>
	typeof value === 'number' &&
	Number.isInteger(value) &&
	value >= 1 &&
	value <= 100_000_000;

const assertCreateElementPayloadInput = (
	input: CreateElementPayloadInput,
): void => {
	if (typeof input.displayName !== 'string' || input.displayName.length === 0) {
		throw new TypeError('displayName must be a non-empty string');
	}

	if (input.displayName.length >= 120)
		throw new TypeError('displayName must be shorter than 120 characters');
	if (makeElementFileNameFromSlug(input.slug) === null)
		throw new TypeError('slug must be a safe lowercase Element slug');
	if (
		typeof input.sourceCode !== 'string' ||
		input.sourceCode.trim().length === 0
	)
		throw new TypeError('sourceCode must be a non-empty string');
	if (input.sourceCode.length >= MAX_SOURCE_CODE_SIZE)
		throw new TypeError(
			`sourceCode must be shorter than ${MAX_SOURCE_CODE_SIZE} characters`,
		);
	if (getElementComponentNameFromSourceCode(input.sourceCode) === null)
		throw new TypeError(
			'sourceCode must contain exactly one exported named React component',
		);
	if (!Array.isArray(input.dependencies))
		throw new TypeError('dependencies must be an array');
	if (input.dependencies.length > MAX_DEPENDENCIES)
		throw new TypeError(
			`dependencies must contain at most ${MAX_DEPENDENCIES} packages`,
		);
	for (const dependency of input.dependencies) {
		assertElementDependency(dependency);
	}

	if (!isDuration(input.durationInFrames))
		throw new TypeError(
			'durationInFrames must be an integer between 1 and 100000000',
		);
	if (
		input.installationMode !== undefined &&
		input.installationMode !== 'wrapped' &&
		input.installationMode !== 'component-owned-sequence'
	) {
		throw new TypeError(
			'installationMode must be "wrapped" or "component-owned-sequence"',
		);
	}
};

export const createElementPayload = (
	input: CreateElementPayloadInput,
): StudioElementPayload => {
	assertCreateElementPayloadInput(input);
	const constructed = makeDragData({
		type: 'element',
		dependencies: [...input.dependencies],
		dimensions: input.dimensions,
		displayName: input.displayName,
		durationInFrames: input.durationInFrames,
		slug: input.slug,
		sourceCode: input.sourceCode,
		installationMode: input.installationMode ?? 'wrapped',
	});
	const payload: StudioElementPayload = {
		...constructed.data,
		durationInFrames: input.durationInFrames,
	};
	if (JSON.stringify(payload).length > MAX_PAYLOAD_SIZE)
		throw new TypeError(
			`The Element payload must be smaller than ${MAX_PAYLOAD_SIZE} characters`,
		);
	return payload;
};

export const parseStudioElementPayload = (
	value: unknown,
): StudioElementPayload | null => {
	if (
		!isRecord(value) ||
		value.type !== 'remotion-element' ||
		value.version !== 1 ||
		!isDuration(value.durationInFrames) ||
		!isRecord(value.element)
	)
		return null;
	const element = parseElementDragData(
		JSON.stringify({
			type: value.type,
			version: value.version,
			element: value.element,
		}),
	);
	if (element === null) return null;
	const payload: StudioElementPayload = {
		...element,
		element: {
			...element.element,
			durationInFrames: value.durationInFrames,
		},
		durationInFrames: value.durationInFrames,
	};
	return JSON.stringify(payload).length <= MAX_PAYLOAD_SIZE ? payload : null;
};
