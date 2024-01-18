import {interpolate, interpolateColors} from 'remotion';
import type {
	CSSPropertiesKey,
	CSSPropertiesValue,
	Style,
	UnitNumberAndFunction,
} from '../../type';
import {breakDownValueIntoUnitNumberAndFunctions} from './utils';

const interpolatedPropertyPart = ({
	inputValue,
	inputRange,
	initialStylePropertyPart,
	finalStylePropertyPart,
	initialStyleProperty,
	finalStyleProperty,
}: {
	inputValue: number;
	inputRange: number[];
	initialStylePropertyPart: UnitNumberAndFunction;
	finalStylePropertyPart: UnitNumberAndFunction;
	initialStyleProperty: CSSPropertiesValue;
	finalStyleProperty: CSSPropertiesValue;
}): string | number => {
	if (finalStylePropertyPart === undefined) {
		throw new TypeError(
			`The start and end values must be of the same type. Start value: ${initialStyleProperty}, end value: ${finalStyleProperty}`,
		);
	}

	if (initialStylePropertyPart.color) {
		if (!finalStylePropertyPart.color) {
			throw new TypeError(
				`The start and end values must be of the same type. Start value: ${initialStyleProperty}, end value: ${finalStyleProperty}`,
			);
		}

		const interpolatedColor = interpolateColors(inputValue, inputRange, [
			initialStylePropertyPart.color,
			finalStylePropertyPart.color as string,
		]);
		return `${interpolatedColor}`;
	}

	if (initialStylePropertyPart.function) {
		if (
			!finalStylePropertyPart?.function ||
			initialStylePropertyPart.function.name !==
				finalStylePropertyPart.function?.name
		) {
			throw new TypeError(
				`The start and end values must be of the same type. Start value: ${initialStyleProperty}, end value: ${finalStyleProperty}`,
			);
		}

		const endValuePartFunction = finalStylePropertyPart.function;
		const endValuePartFunctionArgs = endValuePartFunction.values || [];
		const interpolatedFunctionArgs =
			initialStylePropertyPart.function.values.reduce(
				(acc: string, startValuePartFunctionArg, index) => {
					const endValuePartFunctionArg = endValuePartFunctionArgs[index];
					const interpolatedArg = interpolatedPropertyPart({
						inputValue,
						inputRange,
						initialStylePropertyPart: startValuePartFunctionArg,
						finalStylePropertyPart: endValuePartFunctionArg,
						initialStyleProperty,
						finalStyleProperty,
					});
					return `${acc}, ${interpolatedArg}`;
				},
				'',
			);
		return `${
			initialStylePropertyPart.function.name
		}(${interpolatedFunctionArgs.slice(2)})`;
	}

	if (typeof initialStylePropertyPart.number === 'undefined') {
		if (initialStylePropertyPart.unit !== finalStylePropertyPart.unit) {
			throw new TypeError(
				`Non-animatable values cannot be interpolated. Start value: ${initialStyleProperty}, end value: ${finalStyleProperty}`,
			);
		}

		return `${initialStylePropertyPart.unit}`;
	}

	if (
		initialStylePropertyPart.unit !== finalStylePropertyPart.unit &&
		initialStylePropertyPart.number !== 0 &&
		finalStylePropertyPart.number !== 0
	) {
		throw new TypeError(
			`The units of the start and end values must match. Start value: ${initialStyleProperty}, end value: ${finalStyleProperty}`,
		);
	}

	const startNumber = initialStylePropertyPart.number;
	const endNumber = finalStylePropertyPart.number || 0;
	const interpolatedNumber = interpolate(inputValue, inputRange, [
		startNumber,
		endNumber,
	]);
	const interpolatedUnit =
		initialStylePropertyPart.unit || finalStylePropertyPart.unit || '';

	if (!interpolatedUnit) {
		return interpolatedNumber;
	}

	return `${interpolatedNumber}${interpolatedUnit}`;
};

const interpolateProperty = (
	inputValue: number,
	inputRange: number[],
	initialStyleProperty: CSSPropertiesValue,
	finalStyleProperty: CSSPropertiesValue,
) => {
	if (
		typeof initialStyleProperty !== typeof finalStyleProperty &&
		initialStyleProperty !== 0 &&
		finalStyleProperty !== 0
	) {
		throw new TypeError(
			`The start and end values must be of the same type. Start value: ${initialStyleProperty}, end value: ${finalStyleProperty}`,
		);
	}

	const initialStylePropertyParts =
		breakDownValueIntoUnitNumberAndFunctions(initialStyleProperty);
	const finalStylePropertyParts =
		breakDownValueIntoUnitNumberAndFunctions(finalStyleProperty);

	if (initialStylePropertyParts.length !== finalStylePropertyParts.length) {
		throw new TypeError(
			`The start and end values must have the same structure. Start value: ${initialStyleProperty}, end value: ${finalStyleProperty}`,
		);
	}

	const interpolatedValue = initialStylePropertyParts.reduce(
		(acc, initialStylePropertyPart, index) => {
			return `${acc} ${interpolatedPropertyPart({
				inputValue,
				inputRange,
				initialStylePropertyPart,
				finalStylePropertyPart: finalStylePropertyParts[index],
				initialStyleProperty,
				finalStyleProperty,
			})}`;
		},
		'',
	);
	return interpolatedValue.slice(1);
};

const interpolateStylesFunction = (
	inputValue: number,
	[startingValue, endingValue]: number[],
	initialStyle: Style,
	finalStyle: Style,
): Style => {
	return Object.keys(initialStyle).reduce((acc, key) => {
		if (!finalStyle[key as CSSPropertiesKey]) {
			return {
				...acc,
				[key]: initialStyle[key as CSSPropertiesKey],
			};
		}

		const finalStyleValue = interpolateProperty(
			inputValue,
			[startingValue, endingValue],
			initialStyle[key as CSSPropertiesKey],
			finalStyle[key as CSSPropertiesKey],
		);

		// Avoid number to be a string
		if (!isNaN(Number(finalStyleValue))) {
			return {
				...acc,
				[key]: Number(finalStyleValue),
			};
		}

		return {
			...acc,
			[key]: finalStyleValue,
		};
	}, {});
};

function checkInputRange(arr: readonly number[]) {
	if (arr.length < 2) {
		throw new Error('inputRange must have at least 2 elements');
	}

	for (let index = 0; index < arr.length; index++) {
		if (typeof arr[index] !== 'number') {
			throw new Error(`inputRange must contain only numbers`);
		}

		if (arr[index] === -Infinity || arr[index] === Infinity) {
			throw new Error(
				`inputRange must contain only finite numbers, but got [${arr.join(
					',',
				)}]`,
			);
		}

		if (index > 0 && !(arr[index] > arr[index - 1])) {
			throw new Error(
				`inputRange must be strictly monotonically non-decreasing but got [${arr.join(
					',',
				)}]`,
			);
		}
	}
}

function checkStylesRange(arr: readonly Style[]) {
	if (arr.length < 2) {
		throw new Error('outputStyles must have at least 2 elements');
	}

	for (const index in arr) {
		if (typeof arr[index] !== 'object') {
			throw new Error('outputStyles must contain only objects');
		}
	}
}

/**
 * @description This function allows you to map a range of values to colors using a concise syntax.
 * @see [Documentation](https://www.remotion.dev/docs/interpolate-colors)
 */
export const interpolateStyles = (
	input: number,
	inputRange: number[],
	outputStylesRange: Style[],
) => {
	if (typeof input === 'undefined') {
		throw new Error('input can not be undefined');
	}

	if (typeof inputRange === 'undefined') {
		throw new Error('inputRange can not be undefined');
	}

	if (typeof outputStylesRange === 'undefined') {
		throw new Error('outputRange can not be undefined');
	}

	if (inputRange.length !== outputStylesRange.length) {
		throw new Error(
			'inputRange (' +
				inputRange.length +
				') and outputStylesRange (' +
				outputStylesRange.length +
				') must have the same length',
		);
	}

	checkInputRange(inputRange);
	checkStylesRange(outputStylesRange);

	if (input < inputRange[0]) {
		return outputStylesRange[0];
	}

	if (input >= inputRange[inputRange.length - 1]) {
		return outputStylesRange[outputStylesRange.length - 1];
	}

	const startIndex = inputRange.findIndex((step) => input < step) - 1;
	const endIndex = startIndex + 1;
	const startingValue = inputRange[startIndex];
	const endingValue = inputRange[endIndex];
	const initialStyle = outputStylesRange[startIndex];
	const finalStyle = outputStylesRange[endIndex];
	return interpolateStylesFunction(
		input,
		[startingValue, endingValue],
		initialStyle,
		finalStyle,
	);
};
