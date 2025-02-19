// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/nodes/AnimatedInterpolation.js

export type ExtrapolateType = 'extend' | 'identity' | 'clamp' | 'wrap';

/**
 * @description This function allows you to map a range of values to another with a concise syntax
 * @see [Documentation](https://www.remotion.dev/docs/interpolate)
 */

export type EasingFunction = (input: number) => number;

export type InterpolateOptions = Partial<{
	easing: EasingFunction;
	extrapolateLeft: ExtrapolateType;
	extrapolateRight: ExtrapolateType;
}>;

function interpolateFunction(
	input: number,
	inputRange: [number, number],
	outputRange: [number, number],
	options: Required<InterpolateOptions>,
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
	if (arr.length < 2) {
		throw new Error(name + ' must have at least 2 elements');
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

/*
 * @description Allows you to map a range of values to another using a concise syntax.
 * @see [Documentation](https://remotion.dev/docs/interpolate)
 */
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly number[],
	options?: InterpolateOptions,
): number {
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
	checkInfiniteRange('outputRange', outputRange);

	checkValidInputRange(inputRange);

	const easing = options?.easing ?? ((num: number): number => num);

	let extrapolateLeft: ExtrapolateType = 'extend';
	if (options?.extrapolateLeft !== undefined) {
		extrapolateLeft = options.extrapolateLeft;
	}

	let extrapolateRight: ExtrapolateType = 'extend';
	if (options?.extrapolateRight !== undefined) {
		extrapolateRight = options.extrapolateRight;
	}

	if (typeof input !== 'number') {
		throw new TypeError('Cannot interpolate an input which is not a number');
	}

	const range = findRange(input, inputRange);
	return interpolateFunction(
		input,
		[inputRange[range], inputRange[range + 1]],
		[outputRange[range], outputRange[range + 1]],
		{
			easing,
			extrapolateLeft,
			extrapolateRight,
		},
	);
}
