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
		} else if (extrapolateLeft === 'clamp') {
			result = inputMin;
		} else if (extrapolateLeft === 'extend') {
			// noop
		}
	}

	if (result > inputMax) {
		if (extrapolateRight === 'identity') {
			return result;
		} else if (extrapolateRight === 'clamp') {
			result = inputMax;
		} else if (extrapolateRight === 'extend') {
			// noop
		}
	}

	if (outputMin === outputMax) {
		return outputMin;
	}

	if (inputMin === inputMax) {
		if (input <= inputMin) {
			return outputMin;
		}
		return outputMax;
	}
	// Input Range
	if (inputMin === -Infinity) {
		result = -result;
	} else if (inputMax === Infinity) {
		result = result - inputMin;
	} else {
		result = (result - inputMin) / (inputMax - inputMin);
	}
	// Easing
	result = easing(result);

	// Output Range
	if (outputMin === -Infinity) {
		result = -result;
	} else if (outputMax === Infinity) {
		result = result + outputMin;
	} else {
		result = result * (outputMax - outputMin) + outputMin;
	}

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
	if (arr.length < 2) {
		throw new Error('inputRange must have at least 2 elements');
	}
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
	if (!(arr.length !== 2 || arr[0] !== -Infinity || arr[1] !== Infinity)) {
		throw new Error(
			`${name} must contain only finite numbers, but got [${arr.join(',')}]`
		);
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
	if (
		typeof input === 'undefined' ||
		typeof inputRange === 'undefined' ||
		typeof outputRange === 'undefined'
	) {
		throw new Error('input or inputRange or outputRange can not be undefined');
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
	checkValidInputRange(inputRange);

	checkInfiniteRange('outputRange', outputRange);

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
		throw new TypeError('Cannot interpolation an input which is not a number');
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
