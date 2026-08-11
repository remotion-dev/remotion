import {
	normalizeTimelineNumber,
	roundToDecimalPlaces,
} from './timeline-field-utils';

const PIXEL_PATTERN =
	/^(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?(?:\s+(-?\d+(?:\.\d+)?)px)?$/;
const translateDecimalPlaces = 1;

export type ParsedTranslate = readonly [number, number, number | null];

export const parseTranslate = (value: string): ParsedTranslate => {
	const m = value.match(PIXEL_PATTERN);
	if (!m) {
		return [0, 0, null];
	}

	return [
		normalizeTimelineNumber(Number(m[1])),
		m[2] !== undefined ? normalizeTimelineNumber(Number(m[2])) : 0,
		m[3] !== undefined ? normalizeTimelineNumber(Number(m[3])) : null,
	];
};

const formatTranslateCoordinate = (
	value: number,
	decimalPlaces: number,
): string => {
	const normalized = normalizeTimelineNumber(value);
	const rounded = roundToDecimalPlaces(normalized, decimalPlaces);
	return String(Object.is(rounded, -0) ? 0 : rounded);
};

export const serializeTranslate = (
	[x, y, z]: ParsedTranslate,
	decimalPlaces = translateDecimalPlaces,
): string => {
	const xy = `${formatTranslateCoordinate(x, decimalPlaces)}px ${formatTranslateCoordinate(y, decimalPlaces)}px`;
	return z === null
		? xy
		: `${xy} ${formatTranslateCoordinate(z, decimalPlaces)}px`;
};
