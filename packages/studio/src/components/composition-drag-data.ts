import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import * as z from 'zod/mini';

const REMOTION_DRAG_MIME_TYPE = 'application/vnd.remotion.drag+json';
const DRAG_MIME_VERSION = 1;
const MAX_MIME_TYPE_LENGTH = 512;
const MAX_DIMENSION = 100_000;
const MAX_DURATION_IN_FRAMES = 100_000_000;

export type CompositionDragData = {
	readonly type: 'remotion-composition';
	readonly version: 1;
	readonly compositionId: string;
	readonly compositionFile: string | null;
};

export type CompositionDragPreviewMetadata = {
	readonly type: 'composition';
	readonly width: number | null;
	readonly height: number | null;
	readonly durationInFrames: number | null;
	readonly mimeType: string;
};

type MakeCompositionDragDataInput = {
	readonly compositionFile: string | null;
	readonly compositionId: string;
	readonly width: number | null;
	readonly height: number | null;
	readonly durationInFrames: number | null;
};

type SerializedCompositionDragData = {
	readonly mimeType: string;
	readonly payload: string;
};

type CompositionDragDataTransfer = {
	readonly types: ArrayLike<string>;
	readonly getData: (mimeType: string) => string;
};

const compositionIdSchema = z
	.string()
	.check(
		z.refine(
			(value) =>
				value.length > 0 &&
				value.length < 500 &&
				/^([a-zA-Z0-9-\u4E00-\u9FFF])+$/.test(value),
		),
	);
const compositionFileSchema = z.nullable(
	z
		.string()
		.check(
			z.refine(
				(value) =>
					value.length > 0 &&
					value.length < 2000 &&
					!value.includes('\0') &&
					!value.includes('\\') &&
					!value.startsWith('/') &&
					!value.split('/').includes('..'),
			),
		),
);
const compositionDragDataSchema = z.object({
	type: z.literal('remotion-composition'),
	version: z.literal(1),
	compositionId: compositionIdSchema,
	compositionFile: compositionFileSchema,
});

const parsePositiveNumber = (value: string, max: number): number | null => {
	if (!/^(?:[1-9]\d*|0\.\d+|[1-9]\d*\.\d+)$/.test(value)) {
		return null;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 && parsed <= max ? parsed : null;
};

const parsePositiveInteger = (value: string, max: number): number | null => {
	if (!/^[1-9]\d*$/.test(value)) {
		return null;
	}

	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed <= max ? parsed : null;
};

const parseCompositionDragMimeType = (
	mimeType: string,
): CompositionDragPreviewMetadata | null => {
	if (
		mimeType.length > MAX_MIME_TYPE_LENGTH ||
		!mimeType.startsWith(`${REMOTION_DRAG_MIME_TYPE};`)
	) {
		return null;
	}

	const segments = mimeType.split(';');
	if (segments.shift() !== REMOTION_DRAG_MIME_TYPE) {
		return null;
	}

	const values = new Map<string, string>();
	for (const segment of segments) {
		const separator = segment.indexOf('=');
		if (separator === -1) {
			return null;
		}

		const key = segment.slice(0, separator);
		const value = segment.slice(separator + 1);
		if (
			!['v', 'type', 'width', 'height', 'duration'].includes(key) ||
			value === '' ||
			values.has(key)
		) {
			return null;
		}

		values.set(key, value);
	}

	if (
		values.get('v') !== String(DRAG_MIME_VERSION) ||
		values.get('type') !== 'composition'
	) {
		return null;
	}

	const widthValue = values.get('width');
	const heightValue = values.get('height');
	if ((widthValue === undefined) !== (heightValue === undefined)) {
		return null;
	}

	const width =
		widthValue === undefined
			? null
			: parsePositiveNumber(widthValue, MAX_DIMENSION);
	const height =
		heightValue === undefined
			? null
			: parsePositiveNumber(heightValue, MAX_DIMENSION);
	const durationValue = values.get('duration');
	const durationInFrames =
		durationValue === undefined
			? null
			: parsePositiveInteger(durationValue, MAX_DURATION_IN_FRAMES);
	if (widthValue !== undefined && width === null) {
		return null;
	}

	if (heightValue !== undefined && height === null) {
		return null;
	}

	if (durationValue !== undefined && durationInFrames === null) {
		return null;
	}

	return {
		type: 'composition',
		width,
		height,
		durationInFrames,
		mimeType,
	};
};

export const makeCompositionDragData = ({
	compositionFile,
	compositionId,
	width,
	height,
	durationInFrames,
}: MakeCompositionDragDataInput): SerializedCompositionDragData & {
	readonly data: CompositionDragData;
} => {
	if ((width === null) !== (height === null)) {
		throw new TypeError(
			'width and height must either both be numbers or both be null',
		);
	}

	if (
		width !== null &&
		(!Number.isFinite(width) || width <= 0 || width > MAX_DIMENSION)
	) {
		throw new TypeError(
			`width and height must be numbers between 0 and ${MAX_DIMENSION}`,
		);
	}

	if (
		height !== null &&
		(!Number.isFinite(height) || height <= 0 || height > MAX_DIMENSION)
	) {
		throw new TypeError(
			`width and height must be numbers between 0 and ${MAX_DIMENSION}`,
		);
	}

	if (
		durationInFrames !== null &&
		(!Number.isInteger(durationInFrames) ||
			durationInFrames <= 0 ||
			durationInFrames > MAX_DURATION_IN_FRAMES)
	) {
		throw new TypeError(
			`durationInFrames must be an integer between 1 and ${MAX_DURATION_IN_FRAMES}`,
		);
	}

	const data: CompositionDragData = {
		type: 'remotion-composition',
		version: 1,
		compositionFile,
		compositionId,
	};
	const segments = [
		REMOTION_DRAG_MIME_TYPE,
		`v=${DRAG_MIME_VERSION}`,
		'type=composition',
	];
	if (width !== null && height !== null) {
		segments.push(`width=${width}`, `height=${height}`);
	}

	if (durationInFrames !== null) {
		segments.push(`duration=${durationInFrames}`);
	}

	return {
		mimeType: segments.join(';'),
		payload: JSON.stringify(data),
		data,
	};
};

export const getCompositionDragPreviewMetadata = (
	mimeTypes: ArrayLike<string>,
): CompositionDragPreviewMetadata | null => {
	for (let index = 0; index < mimeTypes.length; index++) {
		const parsed = parseCompositionDragMimeType(mimeTypes[index]);
		if (parsed !== null) {
			return parsed;
		}
	}

	return null;
};

export const parseCompositionDragData = (
	source: SerializedCompositionDragData | CompositionDragDataTransfer,
): CompositionDragData | null => {
	const serialized =
		'types' in source
			? (() => {
					const preview = getCompositionDragPreviewMetadata(source.types);
					return preview === null
						? null
						: {
								mimeType: preview.mimeType,
								payload: source.getData(preview.mimeType),
							};
				})()
			: source;
	if (
		serialized === null ||
		parseCompositionDragMimeType(serialized.mimeType) === null
	) {
		return null;
	}

	try {
		const parsed = z.safeParse(
			compositionDragDataSchema,
			JSON.parse(serialized.payload),
		);
		return parsed.success
			? {
					type: 'remotion-composition',
					version: 1,
					compositionFile: parsed.data.compositionFile,
					compositionId: parsed.data.compositionId,
				}
			: null;
	} catch {
		return null;
	}
};

export const compositionDragDataToSymbolicatedStack = (
	dragData: CompositionDragData,
): SymbolicatedStackFrame | null => {
	if (dragData.compositionFile === null) {
		return null;
	}

	return {
		originalColumnNumber: null,
		originalFileName: dragData.compositionFile,
		originalFunctionName: null,
		originalLineNumber: null,
		originalScriptCode: null,
	};
};
