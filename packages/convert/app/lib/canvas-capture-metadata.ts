import type {MetadataTags} from 'mediabunny';

export const CAPTURE_METADATA_TAG_KEY = 'REMOTION_CAPTURE_DATA';

export type CanvasCaptureMouseMovement = {
	readonly timeInSeconds: number;
	readonly canvasX: number | null;
	readonly canvasY: number | null;
	readonly cursor: string;
};

export type CanvasCapturePointerClick = {
	readonly timeInSeconds: number;
	readonly type: 'pointer-down' | 'pointer-up';
};

export type CanvasCaptureMetadata = {
	readonly density: number;
};

export type CanvasCaptureCursorData = {
	readonly captureMetadata: CanvasCaptureMetadata;
	readonly mouseMovements: CanvasCaptureMouseMovement[];
	readonly pointerClicks: CanvasCapturePointerClick[];
};

export const findCanvasCaptureCursorAtTime = (
	mouseMovements: readonly CanvasCaptureMouseMovement[],
	timeInSeconds: number,
) => {
	let low = 0;
	let high = mouseMovements.length - 1;
	let latest: CanvasCaptureMouseMovement | null = null;

	while (low <= high) {
		const middle = Math.floor((low + high) / 2);
		const movement = mouseMovements[middle];
		if (movement.timeInSeconds <= timeInSeconds) {
			latest = movement;
			low = middle + 1;
		} else {
			high = middle - 1;
		}
	}

	return latest;
};

export const isCanvasCapturePointerDownAtTime = (
	pointerClicks: readonly CanvasCapturePointerClick[],
	timeInSeconds: number,
) => {
	let low = 0;
	let high = pointerClicks.length - 1;
	let latest: CanvasCapturePointerClick | null = null;

	while (low <= high) {
		const middle = Math.floor((low + high) / 2);
		const click = pointerClicks[middle];
		if (click.timeInSeconds <= timeInSeconds) {
			latest = click;
			low = middle + 1;
		} else {
			high = middle - 1;
		}
	}

	return latest?.type === 'pointer-down';
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null;
};

const isFiniteNumber = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};

export const parseCanvasCaptureCursorData = (
	metadata: MetadataTags | null,
): CanvasCaptureCursorData | null => {
	const rawCaptureData = metadata?.raw?.[CAPTURE_METADATA_TAG_KEY];
	if (typeof rawCaptureData !== 'string') {
		return null;
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(rawCaptureData);
	} catch {
		return null;
	}

	if (
		!isRecord(parsed) ||
		!isRecord(parsed.captureMetadata) ||
		!isFiniteNumber(parsed.captureMetadata.density) ||
		parsed.captureMetadata.density <= 0 ||
		!Array.isArray(parsed.mouseMovements)
	) {
		return null;
	}

	const mouseMovements: CanvasCaptureMouseMovement[] = [];
	for (const movement of parsed.mouseMovements) {
		if (
			!isRecord(movement) ||
			!isFiniteNumber(movement.timeInSeconds) ||
			movement.timeInSeconds < 0 ||
			(movement.canvasX !== null && !isFiniteNumber(movement.canvasX)) ||
			(movement.canvasY !== null && !isFiniteNumber(movement.canvasY)) ||
			typeof movement.cursor !== 'string'
		) {
			return null;
		}

		mouseMovements.push({
			timeInSeconds: movement.timeInSeconds,
			canvasX: movement.canvasX,
			canvasY: movement.canvasY,
			cursor: movement.cursor,
		});
	}

	const pointerClicks: CanvasCapturePointerClick[] = [];
	if (parsed.pointerClicks !== undefined) {
		if (!Array.isArray(parsed.pointerClicks)) {
			return null;
		}

		for (const click of parsed.pointerClicks) {
			if (
				!isRecord(click) ||
				!isFiniteNumber(click.timeInSeconds) ||
				click.timeInSeconds < 0 ||
				(click.type !== 'pointer-down' && click.type !== 'pointer-up')
			) {
				return null;
			}

			pointerClicks.push({
				timeInSeconds: click.timeInSeconds,
				type: click.type,
			});
		}
	}

	return {
		captureMetadata: {density: parsed.captureMetadata.density},
		mouseMovements: mouseMovements.sort(
			(a, b) => a.timeInSeconds - b.timeInSeconds,
		),
		pointerClicks: pointerClicks.sort(
			(a, b) => a.timeInSeconds - b.timeInSeconds,
		),
	};
};
