import type {InteractivitySchema} from 'remotion';
import {assertRequiredFiniteNumber} from './validate-effect-param.js';

export const DEFAULT_AMOUNT = 1 as const;
export const DEFAULT_BRIGHTNESS_AMOUNT = 0 as const;
export const DEFAULT_HUE_DEGREES = 0 as const;

export const colorAmountSchema = {
	type: 'number',
	min: 0,
	max: 1,
	step: 0.01,
	default: DEFAULT_AMOUNT,
	description: 'Amount',
	hiddenFromList: false,
} as const satisfies InteractivitySchema['amount'];

export const colorMultiplierSchema = {
	type: 'number',
	min: 0,
	step: 0.01,
	default: DEFAULT_AMOUNT,
	description: 'Amount',
	hiddenFromList: false,
} as const satisfies InteractivitySchema['amount'];

export const brightnessAmountSchema = {
	type: 'number',
	min: -1,
	max: 1,
	step: 0.01,
	default: DEFAULT_BRIGHTNESS_AMOUNT,
	description: 'Amount',
	hiddenFromList: false,
} as const satisfies InteractivitySchema['amount'];

export const hueDegreesSchema = {
	type: 'rotation-degrees',
	step: 1,
	default: DEFAULT_HUE_DEGREES,
	description: 'Degrees',
} as const satisfies InteractivitySchema['degrees'];

export const assertOptionalFiniteNumber = (
	value: unknown,
	name: string,
): void => {
	if (value === undefined) {
		return;
	}

	assertRequiredFiniteNumber(value, name);
};

export const validateUnitInterval = (value: number, name: string): void => {
	if (value < 0) {
		throw new TypeError(
			`"${name}" must be >= 0, but got ${JSON.stringify(value)}`,
		);
	}

	if (value > 1) {
		throw new TypeError(
			`"${name}" must be <= 1, but got ${JSON.stringify(value)}`,
		);
	}
};

export const validateNonNegative = (value: number, name: string): void => {
	if (value < 0) {
		throw new TypeError(
			`"${name}" must be >= 0, but got ${JSON.stringify(value)}`,
		);
	}
};

export const validateSignedUnitInterval = (
	value: number,
	name: string,
): void => {
	if (value < -1) {
		throw new TypeError(
			`"${name}" must be >= -1, but got ${JSON.stringify(value)}`,
		);
	}

	if (value > 1) {
		throw new TypeError(
			`"${name}" must be <= 1, but got ${JSON.stringify(value)}`,
		);
	}
};

export const clampColorChannel = (value: number): number => {
	return Math.max(0, Math.min(255, value));
};

export type ParsedColorRgba = readonly [number, number, number, number];

export const parseColorRgba = (
	ctx: CanvasRenderingContext2D,
	color: string,
): ParsedColorRgba => {
	ctx.clearRect(0, 0, 1, 1);
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	const {data} = ctx.getImageData(0, 0, 1, 1);
	return [data[0], data[1], data[2], data[3]];
};
