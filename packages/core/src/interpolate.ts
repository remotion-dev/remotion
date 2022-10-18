// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/nodes/AnimatedInterpolation.js

type ExtrapolateType = 'extend' | 'identity' | 'clamp';

function interpolateFunction(
	input: number,
	inputRange: [number, number],
	outputRange: [number, number],
	options: {
		easing: (input: number) => number;
		extrapolateLeft: ExtrapolateType;
		extrapolateRight: ExtrapolateType;
	}
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
		} else if (extrapolateLeft === 'extend') {
			// noop
		}
	}

	if (result > inputMax) {
		if (extrapolateRight === 'identity') {
			return result;
		}

		if (extrapolateRight === 'clamp') {
			result = inputMax;
		} else if (extrapolateRight === 'extend') {
			// noop
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
				`inputRange must be strictly monotonically non-decreasing but got [${arr.join(
					','
				)}]`
			);
		}
	}
}

function checkInfiniteRange(name: string, arr: readonly number[]) {
	if (arr.length < 2) {
		throw new Error(name + ' must have at least 2 elements');
	}

	for (const index in arr) {
		if (typeof arr[index] !== 'number') {
			throw new Error(`${name} must contain only numbers`);
		}

		if (arr[index] === -Infinity || arr[index] === Infinity) {
			throw new Error(
				`${name} must contain only finite numbers, but got [${arr.join(',')}]`
			);
		}
	}
}

/**
 * Map a value from an input range to an output range.
 * @link https://www.remotion.dev/docs/interpolate
 * @param {!number} input value to interpolate
 * @param {!number[]} inputRange range of values that you expect the input to assume.
 * @param {!number[]} outputRange range of output values that you want the input to map to.
 * @param {?object} options
 * @param {?Function} options.easing easing function which allows you to customize the input, for example to apply a certain easing function. By default, the input is left unmodified, resulting in a pure linear interpolation {@link https://www.remotion.dev/docs/easing}
 * @param {string=} [options.extrapolateLeft="extend"] What should happen if the input value is outside left the input range, default: "extend" {@link https://www.remotion.dev/docs/interpolate#extrapolateleft}
 * @param {string=} [options.extrapolateRight="extend"] Same as extrapolateLeft, except for values outside right the input range {@link https://www.remotion.dev/docs/interpolate#extrapolateright}
 */
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly number[],
	options?: {
		easing?: (input: number) => number;
		extrapolateLeft?: ExtrapolateType;
		extrapolateRight?: ExtrapolateType;
	}
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
				') must have the same length'
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
		}
	);
}
