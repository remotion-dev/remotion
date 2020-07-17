// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/nodes/AnimatedInterpolation.js

type ExtrapolateType = 'extend' | 'identity' | 'clamp';

export function interpolate({
	input,
	inputRange,
	outputRange,
	easing = (num: number): number => num,
	extrapolateLeft = 'extend',
	extrapolateRight = 'extend',
}: {
	input: number;
	inputRange: [number, number];
	outputRange: [number, number];
	easing?: (input: number) => number;
	extrapolateLeft?: ExtrapolateType;
	extrapolateRight?: ExtrapolateType;
}): number {
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
