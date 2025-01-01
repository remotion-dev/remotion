import type {ExtrapolateType, InterpolateOptions} from 'remotion';
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
	options,
}: {
	inputValue: number;
	inputRange: number[];
	initialStylePropertyPart: UnitNumberAndFunction;
	finalStylePropertyPart: UnitNumberAndFunction;
	initialStyleProperty: CSSPropertiesValue;
	finalStyleProperty: CSSPropertiesValue;
	options: Required<InterpolateOptions>;
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
						options,
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
	const interpolatedNumber = interpolate(
		inputValue,
		inputRange,
		[startNumber, endNumber],
		options,
	);
	const interpolatedUnit =
		initialStylePropertyPart.unit || finalStylePropertyPart.unit || '';

	if (!interpolatedUnit) {
		return interpolatedNumber;
	}

	return `${interpolatedNumber}${interpolatedUnit}`;
};

const interpolateProperty = ({
	inputValue,
	inputRange,
	initialStyleProperty,
	finalStyleProperty,
	options,
}: {
	inputValue: number;
	inputRange: number[];
	initialStyleProperty: CSSPropertiesValue;
	finalStyleProperty: CSSPropertiesValue;
	options: Required<InterpolateOptions>;
}) => {
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
				options,
			})}`;
		},
		'',
	);
	return interpolatedValue.slice(1);
};

const interpolateStylesFunction = ({
	inputValue,
	inputRange,
	initialStyle,
	finalStyle,
	options,
}: {
	inputValue: number;
	inputRange: number[];
	initialStyle: Style;
	finalStyle: Style;
	options: Required<InterpolateOptions>;
}): Style => {
	const [startingValue, endingValue] = inputRange;
	return Object.keys(initialStyle).reduce((acc, key) => {
		const value = finalStyle[key as CSSPropertiesKey];
		if (value === undefined || value === null) {
			return {
				...acc,
				[key]: initialStyle[key as CSSPropertiesKey],
			};
		}

		const finalStyleValue = interpolateProperty({
			inputValue,
			inputRange: [startingValue, endingValue],
			initialStyleProperty: initialStyle[key as CSSPropertiesKey],
			finalStyleProperty: finalStyle[key as CSSPropertiesKey],
			options,
		});

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

/*
 * @description A function that interpolates between two styles based on an input range.
 * @see [Documentation](https://remotion.dev/docs/animation-utils/interpolate-styles)
 */
export const interpolateStyles = (
	input: number,
	inputRange: number[],
	outputStylesRange: Style[],
	options?: InterpolateOptions,
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

	let startIndex = inputRange.findIndex((step) => input < step) - 1;
	if (startIndex === -1) {
		startIndex = 0;
	}

	if (startIndex === -2) {
		startIndex = inputRange.length - 2;
	}

	const endIndex = startIndex + 1;
	const startingValue = inputRange[startIndex];
	const endingValue = inputRange[endIndex];
	const initialStyle = outputStylesRange[startIndex];
	const finalStyle = outputStylesRange[endIndex];

	const easing = options?.easing ?? ((num: number): number => num);

	const extrapolateLeft: ExtrapolateType = options?.extrapolateLeft ?? 'extend';
	const extrapolateRight: ExtrapolateType =
		options?.extrapolateRight ?? 'extend';

	return interpolateStylesFunction({
		inputValue: input,
		inputRange: [startingValue, endingValue],
		initialStyle,
		finalStyle,
		options: {
			easing,
			extrapolateLeft,
			extrapolateRight,
		},
	});
};
