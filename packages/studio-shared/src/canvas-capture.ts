export const CANVAS_CAPTURE_METADATA_TAG = 'REMOTION_CAPTURE_DATA';

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

export type CanvasCaptureData = {
	readonly captureMetadata: {
		readonly density: number;
	};
	readonly mouseMovements: CanvasCaptureMouseMovement[];
	readonly pointerClicks: CanvasCapturePointerClick[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null;
};

const isFiniteNumber = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};

export const parseCanvasCaptureData = (
	metadata: unknown,
): CanvasCaptureData | null => {
	if (!isRecord(metadata) || !isRecord(metadata.raw)) {
		return null;
	}

	const rawCaptureData = metadata.raw[CANVAS_CAPTURE_METADATA_TAG];
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
		!Array.isArray(parsed.mouseMovements) ||
		!Array.isArray(parsed.pointerClicks)
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
