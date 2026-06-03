import {interpolate, type InterpolateOptions} from './interpolate.js';

export type InterpolateRotateOptions = InterpolateOptions;

const degreesValueRegex = /^([+-]?(?:\d+\.?\d*|\.\d+))deg$/;

const parseRotate = (value: string): number => {
	if (typeof value !== 'string') {
		throw new TypeError(
			`outputRange must contain only strings, but got ${typeof value}`,
		);
	}

	const match = degreesValueRegex.exec(value.trim());
	if (match === null) {
		throw new TypeError(
			`interpolateRotate() only supports deg values, but got "${value}"`,
		);
	}

	return Number(match[1]);
};

/*
 * @description Allows you to map a range of values to CSS rotate values using degree units.
 * @see [Documentation](https://remotion.dev/docs/interpolate-rotate)
 */
export const interpolateRotate = (
	input: number,
	inputRange: readonly number[],
	outputRange: readonly string[],
	options?: InterpolateRotateOptions,
): string => {
	if (typeof input === 'undefined') {
		throw new TypeError('input can not be undefined');
	}

	if (typeof inputRange === 'undefined') {
		throw new TypeError('inputRange can not be undefined');
	}

	if (typeof outputRange === 'undefined') {
		throw new TypeError('outputRange can not be undefined');
	}

	if (inputRange.length !== outputRange.length) {
		throw new TypeError(
			'inputRange (' +
				inputRange.length +
				' values provided) and outputRange (' +
				outputRange.length +
				' values provided) must have the same length',
		);
	}

	const parsedOutputRange = outputRange.map((rotateValue) =>
		parseRotate(rotateValue),
	);
	if (parsedOutputRange.length === 0) {
		throw new TypeError('outputRange must have at least 1 element');
	}

	const interpolatedValue = interpolate(
		input,
		inputRange,
		parsedOutputRange,
		options,
	);

	return `${interpolatedValue}deg`;
};
