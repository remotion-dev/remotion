import {interpolate, type InterpolateOptions} from './interpolate.js';

export type InterpolateTranslateOptions = InterpolateOptions;

const pixelValueRegex = /^([+-]?(?:\d+\.?\d*|\.\d+))px$/;

type ParsedTranslate = readonly number[];

const parseTranslate = (value: string): ParsedTranslate => {
	if (typeof value !== 'string') {
		throw new TypeError(
			`outputRange must contain only strings, but got ${typeof value}`,
		);
	}

	const parts = value.trim().split(/\s+/);
	if (parts.length < 1 || parts.length > 3 || parts[0] === '') {
		throw new TypeError(
			`translate values must contain 1 to 3 pixel values, but got "${value}"`,
		);
	}

	return parts.map((part) => {
		const match = pixelValueRegex.exec(part);
		if (match === null) {
			throw new TypeError(
				`interpolateTranslate() only supports px values, but got "${part}" in "${value}"`,
			);
		}

		return Number(match[1]);
	});
};

/*
 * @description Allows you to map a range of values to CSS translate values using pixel units.
 * @see [Documentation](https://remotion.dev/docs/interpolate-translate)
 */
export const interpolateTranslate = (
	input: number,
	inputRange: readonly number[],
	outputRange: readonly string[],
	options?: InterpolateTranslateOptions,
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

	const parsedOutputRange = outputRange.map((translateValue) =>
		parseTranslate(translateValue),
	);
	const firstValueLength = parsedOutputRange[0]?.length;
	if (firstValueLength === undefined) {
		throw new TypeError('outputRange must have at least 1 element');
	}

	for (const parsedTranslate of parsedOutputRange) {
		if (parsedTranslate.length !== firstValueLength) {
			throw new TypeError(
				`All translate values must have the same number of pixel values, but got ${firstValueLength} and ${parsedTranslate.length}`,
			);
		}
	}

	return new Array(firstValueLength)
		.fill(true)
		.map((_, index) => {
			const outputValues: number[] = [];
			for (const translateValue of parsedOutputRange) {
				const value = translateValue[index];
				if (value === undefined) {
					throw new TypeError(
						`All translate values must have the same number of pixel values, but got ${firstValueLength} and ${translateValue.length}`,
					);
				}

				outputValues.push(value);
			}

			const interpolatedValue = interpolate(
				input,
				inputRange,
				outputValues,
				options,
			);

			return `${interpolatedValue}px`;
		})
		.join(' ');
};
