export type CaptionJson = {
	readonly text: string;
	readonly startMs: number;
	readonly endMs: number;
	readonly timestampMs: number | null;
	readonly confidence: number | null;
};

const isNumber = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};

const isNullableNumber = (value: unknown): value is number | null => {
	return value === null || isNumber(value);
};

const isCaption = (value: unknown): value is CaptionJson => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const caption = value as Record<string, unknown>;
	return (
		typeof caption.text === 'string' &&
		isNumber(caption.startMs) &&
		isNumber(caption.endMs) &&
		isNullableNumber(caption.timestampMs) &&
		isNullableNumber(caption.confidence)
	);
};

export const isCaptionJson = (value: unknown): value is CaptionJson[] => {
	return Array.isArray(value) && value.length > 0 && value.every(isCaption);
};
