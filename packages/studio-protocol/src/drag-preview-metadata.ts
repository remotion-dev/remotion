export const REMOTION_DRAG_MIME_TYPE = 'application/vnd.remotion.drag+json';
const DRAG_MIME_VERSION = 1;
const MAX_MIME_TYPE_LENGTH = 512;
const MAX_DIMENSION = 100_000;
const MAX_DURATION_IN_FRAMES = 100_000_000;
const MAX_DURATION_IN_SECONDS = 31_536_000;

type Dimensions = {
	readonly width?: number;
	readonly height?: number;
};

export type AssetDragPreviewMetadata = Dimensions & {
	readonly type: 'asset';
	readonly durationInSeconds?: number;
};

export type ComponentDragPreviewMetadata = Dimensions & {
	readonly type: 'component';
};

export type EffectDragPreviewMetadata = {
	readonly type: 'effect';
};

export type ElementDragPreviewMetadata = Dimensions & {
	readonly type: 'element';
	readonly durationInFrames: number;
};

export type SfxDragPreviewMetadata = {
	readonly type: 'sfx';
};

export type RenderOutputDragPreviewMetadata = {
	readonly type: 'render-output';
};

export type DragPreviewMetadata =
	| AssetDragPreviewMetadata
	| ComponentDragPreviewMetadata
	| EffectDragPreviewMetadata
	| ElementDragPreviewMetadata
	| RenderOutputDragPreviewMetadata
	| SfxDragPreviewMetadata;

export type DragPreviewMetadataWithMimeType = DragPreviewMetadata & {
	readonly mimeType: string;
};

const isBoundedInteger = (value: number, max: number) => {
	return Number.isInteger(value) && value > 0 && value <= max;
};

const isBoundedNumber = (value: number, max: number) => {
	return Number.isFinite(value) && value > 0 && value <= max;
};

const assertDimensions = (metadata: DragPreviewMetadata) => {
	if (!('width' in metadata) && !('height' in metadata)) {
		return;
	}

	const width = 'width' in metadata ? metadata.width : undefined;
	const height = 'height' in metadata ? metadata.height : undefined;

	if (width === undefined && height === undefined) {
		return;
	}

	if (width === undefined || height === undefined) {
		throw new TypeError(
			'width and height must either both be set or both be omitted',
		);
	}

	if (
		!isBoundedNumber(width, MAX_DIMENSION) ||
		!isBoundedNumber(height, MAX_DIMENSION)
	) {
		throw new TypeError(
			`width and height must be numbers between 0 and ${MAX_DIMENSION}`,
		);
	}
};

const assertDuration = (metadata: DragPreviewMetadata) => {
	if (
		metadata.type === 'asset' &&
		metadata.durationInSeconds !== undefined &&
		(!Number.isFinite(metadata.durationInSeconds) ||
			metadata.durationInSeconds <= 0 ||
			metadata.durationInSeconds > MAX_DURATION_IN_SECONDS)
	) {
		throw new TypeError(
			`durationInSeconds must be between 0 and ${MAX_DURATION_IN_SECONDS}`,
		);
	}

	if (
		metadata.type === 'element' &&
		!isBoundedInteger(metadata.durationInFrames, MAX_DURATION_IN_FRAMES)
	) {
		throw new TypeError(
			`durationInFrames must be an integer between 1 and ${MAX_DURATION_IN_FRAMES}`,
		);
	}
};

const getDuration = (metadata: DragPreviewMetadata) => {
	if (metadata.type === 'asset') {
		return metadata.durationInSeconds;
	}

	if (metadata.type === 'element') {
		return metadata.durationInFrames;
	}

	return undefined;
};

export const makeDragMimeType = (metadata: DragPreviewMetadata): string => {
	assertDimensions(metadata);
	assertDuration(metadata);

	const segments = [
		REMOTION_DRAG_MIME_TYPE,
		`v=${DRAG_MIME_VERSION}`,
		`type=${metadata.type}`,
	];

	if ('width' in metadata && metadata.width !== undefined) {
		segments.push(`width=${metadata.width}`, `height=${metadata.height}`);
	}

	const duration = getDuration(metadata);

	if (duration !== undefined) {
		segments.push(`duration=${duration}`);
	}

	return segments.join(';');
};

const parsePositiveInteger = (value: string, max: number): number | null => {
	if (!/^[1-9]\d*$/.test(value)) {
		return null;
	}

	const parsed = Number(value);

	return isBoundedInteger(parsed, max) ? parsed : null;
};

const parsePositiveNumber = (value: string, max: number): number | null => {
	if (!/^(?:[1-9]\d*|0\.\d+|[1-9]\d*\.\d+)$/.test(value)) {
		return null;
	}

	const parsed = Number(value);

	return Number.isFinite(parsed) && parsed > 0 && parsed <= max ? parsed : null;
};

const parseMimeParameters = (mimeType: string): Map<string, string> | null => {
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

	if (values.get('v') !== String(DRAG_MIME_VERSION)) {
		return null;
	}

	return values;
};

const parseMimeDimensions = (
	values: Map<string, string>,
): Dimensions | null => {
	const widthValue = values.get('width');
	const heightValue = values.get('height');

	if (widthValue === undefined && heightValue === undefined) {
		return {};
	}

	if (widthValue === undefined || heightValue === undefined) {
		return null;
	}

	const width = parsePositiveNumber(widthValue, MAX_DIMENSION);
	const height = parsePositiveNumber(heightValue, MAX_DIMENSION);

	if (width === null || height === null) {
		return null;
	}

	return {width, height};
};

export const parseDragMimeType = (
	mimeType: string,
): DragPreviewMetadata | null => {
	const values = parseMimeParameters(mimeType);

	if (values === null) {
		return null;
	}

	const dimensions = parseMimeDimensions(values);

	if (dimensions === null) {
		return null;
	}

	const type = values.get('type');
	const durationValue = values.get('duration');

	switch (type) {
		case 'asset': {
			if (durationValue === undefined) {
				return {type, ...dimensions};
			}

			const durationInSeconds = parsePositiveNumber(
				durationValue,
				MAX_DURATION_IN_SECONDS,
			);

			if (durationInSeconds === null) {
				return null;
			}

			return {type, ...dimensions, durationInSeconds};
		}

		case 'element': {
			if (durationValue === undefined) {
				return null;
			}

			const durationInFrames = parsePositiveInteger(
				durationValue,
				MAX_DURATION_IN_FRAMES,
			);

			if (durationInFrames === null) {
				return null;
			}

			return {type, ...dimensions, durationInFrames};
		}

		case 'component':
			return durationValue === undefined ? {type, ...dimensions} : null;
		case 'effect':
		case 'render-output':
		case 'sfx':
			return dimensions.width === undefined && durationValue === undefined
				? {type}
				: null;
		default:
			return null;
	}
};

export const getDragPreviewMetadata = (
	mimeTypes: ArrayLike<string>,
): DragPreviewMetadataWithMimeType | null => {
	for (let index = 0; index < mimeTypes.length; index++) {
		const mimeType = mimeTypes[index];
		const parsed = parseDragMimeType(mimeType);

		if (parsed !== null) {
			return {...parsed, mimeType};
		}
	}

	return null;
};
