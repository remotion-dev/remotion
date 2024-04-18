import {NoReactInternals} from 'remotion/no-react';
import type {ColorMatchers, CSSPropertiesValue} from '../../type';
import {NUMBER, PERCENTAGE} from './constants';

function call(...args: unknown[]): string {
	return '\\(\\s*(' + args.join(')\\s*,\\s*(') + ')\\s*\\)';
}

function getColorMatchers(): ColorMatchers {
	const cachedMatchers: ColorMatchers = {
		rgb: undefined,
		rgba: undefined,
		hsl: undefined,
		hsla: undefined,
		hex3: undefined,
		hex4: undefined,
		hex5: undefined,
		hex6: undefined,
		hex8: undefined,
	};
	if (cachedMatchers.rgb === undefined) {
		cachedMatchers.rgb = new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER));
		cachedMatchers.rgba = new RegExp(
			'rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER),
		);
		cachedMatchers.hsl = new RegExp(
			'hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE),
		);
		cachedMatchers.hsla = new RegExp(
			'hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER),
		);
		cachedMatchers.hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
		cachedMatchers.hex4 =
			/^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
		cachedMatchers.hex6 = /^#([0-9a-fA-F]{6})$/;
		cachedMatchers.hex8 = /^#([0-9a-fA-F]{8})$/;
	}

	return cachedMatchers;
}

const extractOrderedPartsOfValue = (value: string) => {
	const parts = [];
	let remainingValue = value;

	while (remainingValue.length > 0) {
		const functionMatch = remainingValue.match(/([a-zA-Z-]+)\(([^)]+)\)/);

		// If there's a function, add it to the parts and remove it from the remaining value
		if (functionMatch) {
			const {index} = functionMatch;
			const matchedFunction = functionMatch[0];

			// Add any parts before the function
			if ((index || 0) > 0) {
				parts.push(...remainingValue.substring(0, index).trim().split(/\s+/));
			}

			parts.push(matchedFunction);

			remainingValue = remainingValue.substring(
				(index || 0) + matchedFunction.length,
			);
		} else {
			// If there's no function, add the remaining value to the parts
			parts.push(...remainingValue.trim().split(/\s+/));
			break;
		}
	}

	return parts.filter((part) => part !== ''); // Filter out any empty strings
};

const classifyArgsOfFunction = (value: string) => {
	let nestedLevel = 0;
	const values = [];
	let currentValue = '';

	for (const char of value) {
		if (char === '(') nestedLevel++;
		else if (char === ')') nestedLevel--;

		if (char === ',' && nestedLevel === 0) {
			values.push(currentValue.trim());
			currentValue = '';
		} else {
			currentValue += char;
		}
	}

	if (currentValue) values.push(currentValue.trim());

	// Classify each value
	return values.map((val) => {
		const numberUnitMatch = val.match(/^(-?\d+(?:\.\d+)?)([a-zA-Z%]*)$/);
		if (numberUnitMatch) {
			const number = parseFloat(numberUnitMatch[1]);
			const unit = numberUnitMatch[2];
			return unit ? {number, unit} : {number};
		}

		const numberMatch = val.match(/^(\d+(?:\.\d+)?)$/);
		if (numberMatch) {
			const number = parseFloat(numberMatch[1]);
			return {number};
		}

		return {unit: val};
	});
};

const isColorValue = (value: string) => {
	if (Object.keys(NoReactInternals.colorNames).includes(value)) {
		return true;
	}

	const matchers = getColorMatchers();
	return (
		matchers.rgb?.test(value) ||
		matchers.rgba?.test(value) ||
		matchers.hsl?.test(value) ||
		matchers.hsla?.test(value) ||
		matchers.hex3?.test(value) ||
		matchers.hex4?.test(value) ||
		matchers.hex5?.test(value) ||
		matchers.hex6?.test(value) ||
		matchers.hex8?.test(value)
	);
};

const classifyParts = (parts: string[]) => {
	return parts.map((part) => {
		// Check for a color value like 'red', 'rgba(0, 0, 0, 0)', '#fff', etc.
		if (isColorValue(part)) {
			return {color: part};
		}

		// Check for a function like 'translateX(10px)' or 'rotate(90deg)'
		const functionMatch = part.match(/([a-zA-Z-]+)\(([^)]+)\)/);
		if (functionMatch) {
			const functionName = functionMatch[1];
			const functionValues = classifyArgsOfFunction(functionMatch[2]);
			return {function: {name: functionName, values: functionValues}};
		}

		// Check for a number possibly followed by a unit like '10px' or '10' or '-10px'
		const numberUnitMatch = part.match(/^(-?\d+(?:\.\d+)?)([a-zA-Z%]*)$/);
		if (numberUnitMatch) {
			const number = parseFloat(numberUnitMatch[1]);
			const unit = numberUnitMatch[2];
			return unit ? {number, unit} : {number};
		}

		// Check for a number without a unit like '10' or '-10'
		const numberMatch = part.match(/^(-?\d+(?:\.\d+)?)$/);
		if (numberMatch) {
			const number = parseFloat(numberMatch[1]);
			return {number};
		}

		// If neither, treat as a unit (like 'solid', 'none', etc.)
		return {unit: part};
	});
};

const breakDownValueIntoUnitNumberAndFunctions = (
	value: CSSPropertiesValue,
) => {
	if (typeof value === 'number') {
		return [{number: value}];
	}

	if (typeof value !== 'string') {
		return [];
	}

	const valueParts = extractOrderedPartsOfValue(value);
	return classifyParts(valueParts);
};

export {breakDownValueIntoUnitNumberAndFunctions, getColorMatchers};
