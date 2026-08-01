import {NoReactInternals} from 'remotion/no-react';
import type {ColorMatchers, CSSPropertiesValue} from '../../type';
import {NUMBER, PERCENTAGE} from './constants';

function call(...args: unknown[]): string {
	return '\\(\\s*(' + args.join(')\\s*,\\s*(') + ')\\s*\\)';
}

const MODERN_VALUE = '(?:none|[-+]?\\d*\\.?\\d+(?:%|deg|rad|grad|turn)?)';

function modernColorCall(name: string): RegExp {
	return new RegExp(
		name +
			'\\(\\s*(' +
			MODERN_VALUE +
			')\\s+(' +
			MODERN_VALUE +
			')\\s+(' +
			MODERN_VALUE +
			')(?:\\s*\\/\\s*(' +
			MODERN_VALUE +
			'))?\\s*\\)',
	);
}

const matchers: ColorMatchers = {
	rgb: new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER)),
	rgba: new RegExp('rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER)),
	hsl: new RegExp('hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE)),
	hsla: new RegExp('hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER)),
	hex3: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
	hex4: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
	hex5: undefined,
	hex6: /^#([0-9a-fA-F]{6})$/,
	hex8: /^#([0-9a-fA-F]{8})$/,
	oklch: modernColorCall('oklch'),
	oklab: modernColorCall('oklab'),
	lab: modernColorCall('lab'),
	lch: modernColorCall('lch'),
	hwb: modernColorCall('hwb'),
};

const namedColors = new Set(Object.keys(NoReactInternals.colorNames));
const numberUnitRegex = /^(-?\d+(?:\.\d+)?)([a-zA-Z%]*)$/;
const functionGlobalRegex = /([a-zA-Z-]+)\(([^)]+)\)/g;

const getColorMatchers = (): ColorMatchers => matchers;

const isColorFunction = (name: string, fullValue: string): boolean => {
	const c0 = name.charCodeAt(0);
	if (c0 === 114) {
		// r
		if (name === 'rgb') return matchers.rgb!.test(fullValue);
		if (name === 'rgba') return matchers.rgba!.test(fullValue);
	} else if (c0 === 104) {
		// h
		if (name === 'hsl') return matchers.hsl!.test(fullValue);
		if (name === 'hsla') return matchers.hsla!.test(fullValue);
		if (name === 'hwb') return matchers.hwb!.test(fullValue);
	} else if (c0 === 111) {
		// o
		if (name === 'oklch') return matchers.oklch!.test(fullValue);
		if (name === 'oklab') return matchers.oklab!.test(fullValue);
	} else if (c0 === 108) {
		// l
		if (name === 'lab') return matchers.lab!.test(fullValue);
		if (name === 'lch') return matchers.lch!.test(fullValue);
	}

	return false;
};

const getTrimmed = (s: string, start: number, end: number) => {
	while (start < end && s.charCodeAt(start) <= 32) start++;
	while (end > start && s.charCodeAt(end - 1) <= 32) end--;
	return s.substring(start, end);
};

type ClassifiedValue = {
	color?: string;
	number?: number;
	unit?: string;
	function?: {name: string; values: ClassifiedValue[]};
};

const classifyArg = (val: string): ClassifiedValue => {
	const c0 = val.charCodeAt(0);
	if ((c0 >= 48 && c0 <= 57) || c0 === 45) {
		const match = numberUnitRegex.exec(val);
		if (match) {
			const number = Number(match[1]);
			const unit = match[2];
			return unit ? {number, unit} : {number};
		}
	}

	return {unit: val};
};

const classifyArgsOfFunction = (value: string): ClassifiedValue[] => {
	const result: ClassifiedValue[] = [];
	let nestedLevel = 0;
	let start = 0;
	const len = value.length;
	for (let i = 0; i < len; i++) {
		const code = value.charCodeAt(i);
		if (code === 40) {
			nestedLevel++;
		} else if (code === 41) {
			nestedLevel--;
		} else if (code === 44 && nestedLevel === 0) {
			result.push(classifyArg(getTrimmed(value, start, i)));
			start = i + 1;
		}
	}

	const last = getTrimmed(value, start, len);
	if (last) {
		result.push(classifyArg(last));
	}

	return result;
};

const classifyNonFunctionPart = (token: string): ClassifiedValue => {
	const c0 = token.charCodeAt(0);
	if (c0 === 35) {
		const len = token.length;
		if (len === 4 || len === 5 || len === 7 || len === 9) {
			let valid = true;
			for (let j = 1; j < len; j++) {
				const c = token.charCodeAt(j);
				if (
					!(
						(c >= 48 && c <= 57) ||
						(c >= 65 && c <= 70) ||
						(c >= 97 && c <= 102)
					)
				) {
					valid = false;
					break;
				}
			}

			if (valid) return {color: token};
		}
	} else if (c0 >= 97 && c0 <= 122) {
		if (namedColors.has(token)) return {color: token};
	}

	if ((c0 >= 48 && c0 <= 57) || c0 === 45) {
		const match = numberUnitRegex.exec(token);
		if (match) {
			const number = Number(match[1]);
			const unit = match[2];
			return unit ? {number, unit} : {number};
		}
	}

	return {unit: token};
};

const breakDownValueIntoUnitNumberAndFunctions = (
	value: CSSPropertiesValue,
): ClassifiedValue[] => {
	if (typeof value === 'number') {
		return [{number: value}];
	}

	if (typeof value !== 'string') {
		return [];
	}

	const result: ClassifiedValue[] = [];
	let lastIndex = 0;
	functionGlobalRegex.lastIndex = 0;
	let match;

	while ((match = functionGlobalRegex.exec(value)) !== null) {
		const {index} = match;
		if (index > lastIndex) {
			let cursor = lastIndex;
			while (cursor < index) {
				while (cursor < index && value.charCodeAt(cursor) <= 32) cursor++;
				if (cursor >= index) break;
				let end = cursor;
				while (end < index && value.charCodeAt(end) > 32) end++;
				result.push(classifyNonFunctionPart(value.substring(cursor, end)));
				cursor = end;
			}
		}

		const fullFunction = match[0];
		const name = match[1];
		if (isColorFunction(name, fullFunction)) {
			result.push({color: fullFunction});
		} else {
			result.push({
				function: {
					name,
					values: classifyArgsOfFunction(match[2]),
				},
			});
		}

		lastIndex = functionGlobalRegex.lastIndex;
	}

	const len = value.length;
	let i = lastIndex;
	while (i < len) {
		while (i < len && value.charCodeAt(i) <= 32) i++;
		if (i >= len) break;
		let end = i;
		while (end < len && value.charCodeAt(end) > 32) end++;
		result.push(classifyNonFunctionPart(value.substring(i, end)));
		i = end;
	}

	return result;
};

export {breakDownValueIntoUnitNumberAndFunctions, getColorMatchers};
