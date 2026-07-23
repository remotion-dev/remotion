import {
	normalizeTimelineNumber,
	roundToDecimalPlaces,
} from './timeline-field-utils';

const PIXEL_PATTERN = /^(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?$/;
const translateDecimalPlaces = 1;

export const parseTranslate = (value: string): [number, number] => {
	const m = value.match(PIXEL_PATTERN);
	if (!m) {
		return [0, 0];
	}

	return [
		normalizeTimelineNumber(Number(m[1])),
		m[2] !== undefined ? normalizeTimelineNumber(Number(m[2])) : 0,
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
	x: number,
	y: number,
	decimalPlaces = translateDecimalPlaces,
): string => {
	return `${formatTranslateCoordinate(x, decimalPlaces)}px ${formatTranslateCoordinate(
		y,
		decimalPlaces,
	)}px`;
};
