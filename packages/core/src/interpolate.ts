import {normalizeNumber} from './normalize-number.js';

// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/nodes/AnimatedInterpolation.js

export type ExtrapolateType = 'extend' | 'identity' | 'clamp' | 'wrap';

/**
 * @description This function allows you to map a range of values to another with a concise syntax
 * @see [Documentation](https://www.remotion.dev/docs/interpolate)
 */

export type EasingFunction = (input: number) => number;

export type InterpolateOptions = Partial<{
	easing: EasingFunction | readonly EasingFunction[];
	extrapolateLeft: ExtrapolateType;
	extrapolateRight: ExtrapolateType;
	posterize: number;
}>;

type InterpolateSegmentResolvedOptions = {
	easing: EasingFunction;
	extrapolateLeft: ExtrapolateType;
	extrapolateRight: ExtrapolateType;
};

type StringInterpolationKind = 'scale' | 'translate' | 'rotate';

type ParsedStringInterpolationValue = {
	kind: StringInterpolationKind;
	values: [number, number, number];
	units: [string | null, string | null, string | null];
	dimensions: number;
};

const angleUnits = new Set(['deg', 'rad', 'grad', 'turn']);
const lengthUnits = new Set([
	'%',
	'cap',
	'ch',
	'cm',
	'cqb',
	'cqh',
	'cqi',
	'cqmax',
	'cqmin',
	'cqw',
	'dvh',
	'dvw',
	'em',
	'ex',
	'ic',
	'in',
	'lh',
	'lvh',
	'lvw',
	'mm',
	'pc',
	'pt',
	'px',
	'q',
	'rem',
	'rlh',
	'svh',
	'svw',
	'vb',
	'vh',
	'vi',
	'vmax',
	'vmin',
	'vw',
]);

const cssNumberRegex = /^([+-]?(?:\d+\.?\d*|\.\d+))([a-zA-Z%]+)?$/;

const stringifyNumber = (value: number): string => {
	return String(normalizeNumber(value));
};

const parseStringInterpolationComponent = (
	component: string,
	value: string,
): {
	kind: StringInterpolationKind;
	value: number;
	unit: string | null;
} => {
	const match = cssNumberRegex.exec(component);
	if (match === null) {
		throw new TypeError(
			`Cannot interpolate "${value}" because "${component}" is not a supported scale, translate, or rotate value`,
		);
	}

	const unit = match[2] ?? null;
	const numberValue = Number(match[1]);
	if (!Number.isFinite(numberValue)) {
		throw new TypeError(
			`Cannot interpolate "${value}" because "${component}" is not finite`,
		);
	}

	if (unit === null) {
		return {kind: 'scale', value: numberValue, unit: null};
	}

	if (angleUnits.has(unit)) {
		return {kind: 'rotate', value: numberValue, unit};
	}

	if (lengthUnits.has(unit)) {
		return {kind: 'translate', value: numberValue, unit};
	}

	throw new TypeError(
		`Cannot interpolate "${value}" because "${unit}" is not a supported translate or rotate unit`,
	);
};

const parseStringInterpolationValue = (
	output: string | number,
): ParsedStringInterpolationValue => {
	if (typeof output === 'number') {
		if (!Number.isFinite(output)) {
			throw new Error(
				`outputRange must contain only finite numbers, but got [${output}]`,
			);
		}

		return {
			kind: 'scale',
			values: [output, output, 1],
			units: [null, null, null],
			dimensions: 1,
		};
	}

	const parts = output.trim().split(/\s+/);
	if (parts.length < 1 || parts.length > 3 || parts[0] === '') {
		throw new TypeError(
			`String outputRange values must contain 1 to 3 components, but got "${output}"`,
		);
	}

	const parsed = parts.map((part) =>
		parseStringInterpolationComponent(part, output),
	);
	const [{kind}] = parsed;
	for (const part of parsed) {
		if (part.kind !== kind) {
			throw new TypeError(
				`Cannot interpolate "${output}" because it mixes ${kind} and ${part.kind} values`,
			);
		}
	}

	if (kind === 'scale') {
		const x = parsed[0].value;
		const y = parsed[1]?.value ?? x;
		const z = parsed[2]?.value ?? 1;
		return {
			kind,
			values: [x, y, z],
			units: [null, null, null],
			dimensions: parsed.length,
		};
	}

	return {
		kind,
		values: [parsed[0].value, parsed[1]?.value ?? 0, parsed[2]?.value ?? 0],
		units: [parsed[0].unit, parsed[1]?.unit ?? null, parsed[2]?.unit ?? null],
		dimensions: parsed.length,
	};
};

const serializeStringInterpolationValue = ({
	kind,
	values,
	units,
	dimensions,
}: ParsedStringInterpolationValue): string => {
	if (kind === 'scale') {
		return values
			.slice(0, dimensions)
			.map((value) => stringifyNumber(value))
			.join(' ');
	}

	return values
		.slice(0, dimensions)
		.map((value, index) => `${stringifyNumber(value)}${units[index]}`)
		.join(' ');
};

function interpolateFunction(
	input: number,
	inputRange: [number, number],
	outputRange: [number, number],
	options: InterpolateSegmentResolvedOptions,
): number {
	const {extrapolateLeft, extrapolateRight, easing} = options;

	let result = input;
	const [inputMin, inputMax] = inputRange;
	const [outputMin, outputMax] = outputRange;

	if (result < inputMin) {
		if (extrapolateLeft === 'identity') {
			return result;
		}

		if (extrapolateLeft === 'clamp') {
			result = inputMin;
		} else if (extrapolateLeft === 'wrap') {
			const range = inputMax - inputMin;
			result = ((((result - inputMin) % range) + range) % range) + inputMin;
		} else if (extrapolateLeft === 'extend') {
			// Noop
		}
	}

	if (result > inputMax) {
		if (extrapolateRight === 'identity') {
			return result;
		}

		if (extrapolateRight === 'clamp') {
			result = inputMax;
		} else if (extrapolateRight === 'wrap') {
			const range = inputMax - inputMin;
			result = ((((result - inputMin) % range) + range) % range) + inputMin;
		} else if (extrapolateRight === 'extend') {
			// Noop
		}
	}

	if (outputMin === outputMax) {
		return outputMin;
	}

	// Input Range
	result = (result - inputMin) / (inputMax - inputMin);

	// Easing
	result = easing(result);

	// Output Range
	result = result * (outputMax - outputMin) + outputMin;

	return result;
}

function findRange(input: number, inputRange: readonly number[]) {
	let i;
	for (i = 1; i < inputRange.length - 1; ++i) {
		if (inputRange[i] >= input) {
			break;
		}
	}

	return i - 1;
}

const defaultEasing = (num: number): number => num;

const interpolateNumber = ({
	input,
	inputRange,
	outputRange,
	options,
}: {
	input: number;
	inputRange: readonly number[];
	outputRange: readonly number[];
	options: InterpolateOptions | undefined;
}): number => {
	if (inputRange.length === 1) {
		return outputRange[0];
	}

	const easingOption = options?.easing;
	const resolveEasingForSegment = (segmentIndex: number): EasingFunction => {
		if (easingOption === undefined) {
			return defaultEasing;
		}

		if (typeof easingOption === 'function') {
			return easingOption;
		}

		// `segmentIndex` is in [0, inputRange.length - 2]; array length was validated above.
		return easingOption[segmentIndex] as EasingFunction;
	};

	let extrapolateLeft: ExtrapolateType = 'extend';
	if (options?.extrapolateLeft !== undefined) {
		extrapolateLeft = options.extrapolateLeft;
	}

	let extrapolateRight: ExtrapolateType = 'extend';
	if (options?.extrapolateRight !== undefined) {
		extrapolateRight = options.extrapolateRight;
	}

	const posterizedInput =
		options?.posterize === undefined
			? input
			: Math.floor(input / options.posterize) * options.posterize;
	const range = findRange(posterizedInput, inputRange);
	return interpolateFunction(
		posterizedInput,
		[inputRange[range], inputRange[range + 1]],
		[outputRange[range], outputRange[range + 1]],
		{
			easing: resolveEasingForSegment(range),
			extrapolateLeft,
			extrapolateRight,
		},
	);
};

const interpolateString = ({
	input,
	inputRange,
	outputRange,
	options,
}: {
	input: number;
	inputRange: readonly number[];
	outputRange: readonly (string | number)[];
	options: InterpolateOptions | undefined;
}): string => {
	const parsedOutputRange = outputRange.map(parseStringInterpolationValue);
	const kind = parsedOutputRange[0]?.kind;
	if (kind === undefined) {
		throw new Error('outputRange must have at least 1 element');
	}

	for (const parsed of parsedOutputRange) {
		if (parsed.kind !== kind) {
			throw new TypeError(
				`Cannot interpolate ${kind} values with ${parsed.kind} values`,
			);
		}
	}

	const dimensions = Math.max(
		...parsedOutputRange.map((parsed) => parsed.dimensions),
	);
	const units: [string | null, string | null, string | null] = [
		null,
		null,
		null,
	];

	if (kind !== 'scale') {
		for (let axis = 0; axis < dimensions; axis++) {
			for (const parsed of parsedOutputRange) {
				const unit = parsed.units[axis];
				if (unit === null) {
					continue;
				}

				if (units[axis] === null) {
					units[axis] = unit;
					continue;
				}

				if (units[axis] !== unit) {
					throw new TypeError(
						`Cannot interpolate ${kind} values with different units on axis ${axis + 1}: ${units[axis]} and ${unit}`,
					);
				}
			}

			if (units[axis] === null) {
				throw new TypeError(
					`Cannot interpolate ${kind} values because axis ${axis + 1} has no unit`,
				);
			}
		}
	}

	return serializeStringInterpolationValue({
		kind,
		values: [0, 0, 0].map((_, axis) =>
			interpolateNumber({
				input,
				inputRange,
				outputRange: parsedOutputRange.map((parsed) => parsed.values[axis]),
				options,
			}),
		) as [number, number, number],
		units,
		dimensions,
	});
};

function checkValidInputRange(arr: readonly number[]) {
	for (let i = 1; i < arr.length; ++i) {
		if (!(arr[i] > arr[i - 1])) {
			throw new Error(
				`inputRange must be strictly monotonically increasing but got [${arr.join(
					',',
				)}]`,
			);
		}
	}
}

function checkInfiniteRange(name: string, arr: readonly number[]) {
	if (arr.length < 1) {
		throw new Error(name + ' must have at least 1 element');
	}

	for (const element of arr) {
		if (typeof element !== 'number') {
			throw new Error(`${name} must contain only numbers`);
		}

		if (!Number.isFinite(element)) {
			throw new Error(
				`${name} must contain only finite numbers, but got [${arr.join(',')}]`,
			);
		}
	}
}

export function assertValidInterpolateEasingOption(
	easing: EasingFunction | readonly EasingFunction[] | undefined,
	inputRangeLength: number,
) {
	if (easing === undefined) {
		return;
	}

	if (typeof easing === 'function') {
		return;
	}

	const expectedLength = inputRangeLength - 1;
	if (easing.length !== expectedLength) {
		throw new Error(
			`When easing is an array, it must have one entry per segment between keyframes (length inputRange.length - 1 = ${expectedLength}), but got length ${easing.length}`,
		);
	}

	for (let i = 0; i < easing.length; i++) {
		if (typeof easing[i] !== 'function') {
			throw new Error(`easing[${i}] must be a function`);
		}
	}
}

export function assertValidInterpolatePosterizeOption(
	posterize: number | undefined,
) {
	if (posterize === undefined) {
		return;
	}

	if (
		typeof posterize !== 'number' ||
		!Number.isFinite(posterize) ||
		posterize <= 0
	) {
		throw new Error(
			`posterize must be a positive finite number, but got ${posterize}`,
		);
	}
}

/*
 * @description Allows you to map a range of values to another using a concise syntax.
 * @see [Documentation](https://remotion.dev/docs/interpolate)
 */
/* eslint-disable no-redeclare */
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly number[],
	options?: InterpolateOptions,
): number;
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly string[],
	options?: InterpolateOptions,
): string;
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly (number | string)[],
	options?: InterpolateOptions,
): number | string;
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly (number | string)[],
	options?: InterpolateOptions,
): number | string {
	if (typeof input === 'undefined') {
		throw new Error('input can not be undefined');
	}

	if (typeof inputRange === 'undefined') {
		throw new Error('inputRange can not be undefined');
	}

	if (typeof outputRange === 'undefined') {
		throw new Error('outputRange can not be undefined');
	}

	if (inputRange.length !== outputRange.length) {
		throw new Error(
			'inputRange (' +
				inputRange.length +
				') and outputRange (' +
				outputRange.length +
				') must have the same length',
		);
	}

	checkInfiniteRange('inputRange', inputRange);
	checkValidInputRange(inputRange);

	assertValidInterpolateEasingOption(options?.easing, inputRange.length);
	assertValidInterpolatePosterizeOption(options?.posterize);

	if (typeof input !== 'number') {
		throw new TypeError('Cannot interpolate an input which is not a number');
	}

	if (!Array.isArray(outputRange)) {
		throw new Error('outputRange must contain only numbers');
	}

	const hasStringOutput = outputRange.some(
		(output) => typeof output === 'string',
	);
	if (hasStringOutput) {
		if (
			!outputRange.every(
				(output) => typeof output === 'string' || typeof output === 'number',
			)
		) {
			throw new TypeError(
				'outputRange must contain only numbers, or supported scale, translate, and rotate strings',
			);
		}

		return interpolateString({input, inputRange, outputRange, options});
	}

	if (!outputRange.every((output) => typeof output === 'number')) {
		throw new TypeError(
			'outputRange must contain only numbers, or supported scale, translate, and rotate strings',
		);
	}

	checkInfiniteRange('outputRange', outputRange);

	return interpolateNumber({input, inputRange, outputRange, options});
}
/* eslint-enable no-redeclare */
