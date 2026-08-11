import {normalizeNumber} from './normalize-number.js';

export type ScaleValue = readonly [number, number, number];

const defaultScaleValue: ScaleValue = [1, 1, 1];

const parseScaleString = (value: string): ScaleValue | null => {
	const parts = value.trim().split(/\s+/);
	if (parts.length < 1 || parts.length > 3 || parts[0] === '') {
		return null;
	}

	const parsed = parts.map((part) => Number(part));
	if (!parsed.every((part) => Number.isFinite(part))) {
		return null;
	}

	const x = parsed[0];
	const y = parsed[1] ?? x;
	const z = parsed[2] ?? 1;

	return [x, y, z];
};

export const parseValidScaleValue = (value: unknown): ScaleValue | null => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? [value, value, 1] : null;
	}

	if (typeof value === 'string') {
		return parseScaleString(value);
	}

	return null;
};

export const parseScaleValue = (value: unknown): ScaleValue => {
	return parseValidScaleValue(value) ?? defaultScaleValue;
};

export const serializeScaleValue = ([x, y, z]: ScaleValue): number | string => {
	const normalizedX = normalizeNumber(x);
	const normalizedY = normalizeNumber(y);
	const normalizedZ = normalizeNumber(z);

	if (normalizedX === normalizedY && normalizedZ === 1) {
		return normalizedX;
	}

	if (normalizedZ === 1) {
		return `${normalizedX} ${normalizedY}`;
	}

	return `${normalizedX} ${normalizedY} ${normalizedZ}`;
};
