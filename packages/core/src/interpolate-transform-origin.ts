import type {InterpolateOptions} from './interpolate.js';
import {interpolate} from './interpolate.js';

const horizontalKeywords = {
	left: '0%',
	center: '50%',
	right: '100%',
} as const;

const verticalKeywords = {
	top: '0%',
	center: '50%',
	bottom: '100%',
} as const;

const lengthUnits = new Set([
	'cap',
	'ch',
	'cm',
	'cqb',
	'cqh',
	'cqi',
	'cqmax',
	'cqmin',
	'cqw',
	'dvh',
	'dvw',
	'em',
	'ex',
	'ic',
	'in',
	'lh',
	'lvh',
	'lvw',
	'mm',
	'pc',
	'pt',
	'px',
	'q',
	'rem',
	'rlh',
	'svh',
	'svw',
	'vb',
	'vh',
	'vi',
	'vmax',
	'vmin',
	'vw',
]);

const cssLengthPercentageRegex = /^([+-]?(?:\d+\.?\d*|\.\d+))([a-zA-Z%]+)?$/;

type TransformOriginComponent = {
	kind: 'horizontal' | 'vertical' | 'center' | 'length-percentage';
	value: string;
	unit: string | null;
};

const parseComponent = (
	component: string,
	originalValue: string,
): TransformOriginComponent => {
	const normalized = component.toLowerCase();
	if (normalized === 'left' || normalized === 'right') {
		return {
			kind: 'horizontal',
			value: horizontalKeywords[normalized],
			unit: '%',
		};
	}

	if (normalized === 'top' || normalized === 'bottom') {
		return {kind: 'vertical', value: verticalKeywords[normalized], unit: '%'};
	}

	if (normalized === 'center') {
		return {kind: 'center', value: '50%', unit: '%'};
	}

	const match = cssLengthPercentageRegex.exec(component);
	if (match === null) {
		throw new TypeError(
			`Cannot interpolate transform-origin "${originalValue}" because "${component}" is not a supported keyword, length, or percentage`,
		);
	}

	const unit = match[2] ?? null;
	if (unit !== null && unit !== '%' && !lengthUnits.has(unit)) {
		throw new TypeError(
			`Cannot interpolate transform-origin "${originalValue}" because "${unit}" is not a supported length unit`,
		);
	}

	const numberValue = Number(match[1]);
	if (!Number.isFinite(numberValue)) {
		throw new TypeError(
			`Cannot interpolate transform-origin "${originalValue}" because "${component}" is not finite`,
		);
	}

	if (unit === null) {
		if (numberValue !== 0) {
			throw new TypeError(
				`Cannot interpolate transform-origin "${originalValue}" because "${component}" needs a length unit`,
			);
		}

		return {kind: 'length-percentage', value: '0px', unit: 'px'};
	}

	return {kind: 'length-percentage', value: component, unit};
};

const resolveTwoComponentOrigin = ({
	first,
	second,
	originalValue,
}: {
	first: TransformOriginComponent;
	second: TransformOriginComponent;
	originalValue: string;
}): [string, string] => {
	if (first.kind === 'horizontal') {
		if (second.kind === 'horizontal') {
			throw new TypeError(
				`Cannot interpolate transform-origin "${originalValue}" because it contains two horizontal keywords`,
			);
		}

		return [first.value, second.value];
	}

	if (first.kind === 'vertical') {
		if (second.kind === 'vertical') {
			throw new TypeError(
				`Cannot interpolate transform-origin "${originalValue}" because it contains two vertical keywords`,
			);
		}

		return [second.value, first.value];
	}

	if (second.kind === 'horizontal') {
		return [second.value, first.value];
	}

	if (second.kind === 'vertical') {
		return [first.value, second.value];
	}

	return [first.value, second.value];
};

export const normalizeTransformOrigin = (value: string): string => {
	const parts = value.trim().split(/\s+/);
	if (parts.length < 1 || parts.length > 3 || parts[0] === '') {
		throw new TypeError(
			`transform-origin values must contain 1 to 3 components, but got "${value}"`,
		);
	}

	const parsed = parts.map((part) => parseComponent(part, value));
	const z = parsed[2];
	if (z !== undefined) {
		if (z.kind !== 'length-percentage' || z.unit === '%') {
			throw new TypeError(
				`Cannot interpolate transform-origin "${value}" because the z component must be a length`,
			);
		}

		if (parsed[0].kind === 'vertical' || parsed[1].kind === 'horizontal') {
			throw new TypeError(
				`Cannot interpolate transform-origin "${value}" because three-component values must specify the x position before the y position`,
			);
		}
	}

	if (parsed.length === 1) {
		const [component] = parsed;
		if (component.kind === 'vertical') {
			return `50% ${component.value}`;
		}

		return `${component.value} 50%`;
	}

	const [x, y] = resolveTwoComponentOrigin({
		first: parsed[0],
		second: parsed[1],
		originalValue: value,
	});

	return z === undefined ? `${x} ${y}` : `${x} ${y} ${z.value}`;
};

/**
 * @description Interpolates CSS transform-origin values, including transform-origin keywords.
 * @see [Documentation](https://www.remotion.dev/docs/interpolate-transform-origin)
 */
export const interpolateTransformOrigin = (
	input: number,
	inputRange: readonly number[],
	outputRange: readonly string[],
	options?: InterpolateOptions,
): string => {
	return interpolate(
		input,
		inputRange,
		outputRange.map(normalizeTransformOrigin),
		options,
	);
};
