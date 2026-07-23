const DRAG_PREVIEW_MIME_TYPE = 'application/vnd.remotion.preview';
const DRAG_PREVIEW_VERSION = 1;
const MAX_MIME_TYPE_LENGTH = 512;
const MAX_DIMENSION = 100_000;
const MAX_DURATION_IN_FRAMES = 100_000_000;
const MAX_DURATION_IN_SECONDS = 31_536_000;

type Dimensions = {
	readonly width?: number;
	readonly height?: number;
};

export type AssetDragPreviewMetadata = Dimensions & {
	readonly kind: 'asset';
	readonly durationInSeconds?: number;
};

export type CompositionDragPreviewMetadata = Dimensions & {
	readonly kind: 'composition';
	readonly durationInFrames?: number;
};

export type ElementDragPreviewMetadata = Dimensions & {
	readonly kind: 'element';
	readonly durationInFrames?: number;
};

export type DragPreviewMetadata =
	| AssetDragPreviewMetadata
	| CompositionDragPreviewMetadata
	| ElementDragPreviewMetadata;

type DataTransferWithSetData = {
	readonly setData: (format: string, data: string) => void;
};

const isBoundedInteger = (value: number, max: number) => {
	return Number.isInteger(value) && value > 0 && value <= max;
};

const assertDimensions = (metadata: DragPreviewMetadata) => {
	const {height, width} = metadata;

	if (width === undefined && height === undefined) {
		return;
	}

	if (width === undefined || height === undefined) {
		throw new TypeError(
			'width and height must either both be set or both be omitted',
		);
	}

	if (
		!isBoundedInteger(width, MAX_DIMENSION) ||
		!isBoundedInteger(height, MAX_DIMENSION)
	) {
		throw new TypeError(
			`width and height must be integers between 1 and ${MAX_DIMENSION}`,
		);
	}
};

const assertDuration = (metadata: DragPreviewMetadata) => {
	if (metadata.kind === 'asset') {
		if (
			metadata.durationInSeconds !== undefined &&
			(!Number.isFinite(metadata.durationInSeconds) ||
				metadata.durationInSeconds <= 0 ||
				metadata.durationInSeconds > MAX_DURATION_IN_SECONDS)
		) {
			throw new TypeError(
				`durationInSeconds must be between 0 and ${MAX_DURATION_IN_SECONDS}`,
			);
		}

		return;
	}

	if (
		metadata.durationInFrames !== undefined &&
		!isBoundedInteger(metadata.durationInFrames, MAX_DURATION_IN_FRAMES)
	) {
		throw new TypeError(
			`durationInFrames must be an integer between 1 and ${MAX_DURATION_IN_FRAMES}`,
		);
	}
};

const getDuration = (metadata: DragPreviewMetadata): number | undefined => {
	if (metadata.kind === 'asset') {
		return metadata.durationInSeconds;
	}

	return metadata.durationInFrames;
};

export const makeDragPreviewMimeType = (
	metadata: DragPreviewMetadata,
): string => {
	assertDimensions(metadata);
	assertDuration(metadata);

	const segments = [
		DRAG_PREVIEW_MIME_TYPE,
		`v=${DRAG_PREVIEW_VERSION}`,
		`kind=${metadata.kind}`,
	];

	if (metadata.width !== undefined) {
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

export const parseDragPreviewMimeType = (
	mimeType: string,
): DragPreviewMetadata | null => {
	if (
		mimeType.length > MAX_MIME_TYPE_LENGTH ||
		!mimeType.startsWith(`${DRAG_PREVIEW_MIME_TYPE};`)
	) {
		return null;
	}

	const segments = mimeType.split(';');
	if (segments.shift() !== DRAG_PREVIEW_MIME_TYPE) {
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
			!['v', 'kind', 'width', 'height', 'duration'].includes(key) ||
			value === '' ||
			values.has(key)
		) {
			return null;
		}

		values.set(key, value);
	}

	if (values.get('v') !== String(DRAG_PREVIEW_VERSION)) {
		return null;
	}

	const kind = values.get('kind');
	if (kind !== 'asset' && kind !== 'composition' && kind !== 'element') {
		return null;
	}

	const widthValue = values.get('width');
	const heightValue = values.get('height');
	if ((widthValue === undefined) !== (heightValue === undefined)) {
		return null;
	}

	const width =
		widthValue === undefined
			? undefined
			: parsePositiveInteger(widthValue, MAX_DIMENSION);
	const height =
		heightValue === undefined
			? undefined
			: parsePositiveInteger(heightValue, MAX_DIMENSION);
	if (width === null || height === null) {
		return null;
	}

	const durationValue = values.get('duration');
	const duration =
		durationValue === undefined
			? undefined
			: kind === 'asset'
				? parsePositiveNumber(durationValue, MAX_DURATION_IN_SECONDS)
				: parsePositiveInteger(durationValue, MAX_DURATION_IN_FRAMES);
	if (duration === null) {
		return null;
	}

	const dimensions =
		width === undefined ? {} : {width, height: height as number};

	if (kind === 'asset') {
		return {
			kind,
			...dimensions,
			...(duration === undefined ? {} : {durationInSeconds: duration}),
		};
	}

	return {
		kind,
		...dimensions,
		...(duration === undefined ? {} : {durationInFrames: duration}),
	};
};

export const setDragPreviewMetadata = (
	dataTransfer: DataTransferWithSetData,
	metadata: DragPreviewMetadata,
) => {
	const mimeType = makeDragPreviewMimeType(metadata);
	dataTransfer.setData(mimeType, '');
	return mimeType;
};

export const getDragPreviewMetadata = (
	mimeTypes: ArrayLike<string>,
): DragPreviewMetadata | null => {
	for (let index = 0; index < mimeTypes.length; index++) {
		const parsed = parseDragPreviewMimeType(mimeTypes[index]);
		if (parsed !== null) {
			return parsed;
		}
	}

	return null;
};
