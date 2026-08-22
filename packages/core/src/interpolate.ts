import {Easing} from './easing.js';
import {normalizeNumber} from './normalize-number.js';

// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/nodes/AnimatedInterpolation.js

export type ExtrapolateType = 'extend' | 'identity' | 'clamp' | 'wrap';
export type InterpolateOutputOption = 'linear' | 'perceptual-scale';

/**
 * @description This function allows you to map a range of values to another with a concise syntax
 * @see [Documentation](https://www.remotion.dev/docs/interpolate)
 */

export type EasingFunction = ((input: number) => number) & {
	readonly remotionShouldExtendRight?: boolean;
};

export type InterpolateOptions = Partial<{
	easing: EasingFunction | readonly EasingFunction[];
	extrapolateLeft: ExtrapolateType;
	extrapolateRight: ExtrapolateType;
	output: InterpolateOutputOption;
	posterize: number;
}>;

type InterpolateSegmentResolvedOptions = {
	easing: EasingFunction;
	extrapolateLeft: ExtrapolateType;
	extrapolateRight: ExtrapolateType;
	output: InterpolateOutputOption;
};

type StringInterpolationKind = 'scale' | 'translate' | 'rotate';

type ParsedStringInterpolationValue = {
	kind: StringInterpolationKind;
	values: [number, number, number, number];
	units: [string | null, string | null, string | null, string | null];
	dimensions: number;
	axisRotation: boolean;
};

type TransformOriginAxis = 'x' | 'y';
type TransformOriginAxisValue = {
	value: number;
	unit: string;
};

type NumericTuple = readonly [number, ...number[]];
type InterpolateOutputValue = number | string | readonly number[];
type WidenNumericTuple<T extends readonly number[]> = {
	readonly [Key in keyof T]: number;
};

const angleUnits = new Set(['deg', 'rad', 'grad', 'turn']);
const lengthUnits = new Set([
	'%',
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

const cssNumberRegex = /^([+-]?(?:\d+\.?\d*|\.\d+))([a-zA-Z%]+)?$/;
const transformOriginKeywords = new Set([
	'left',
	'center',
	'right',
	'top',
	'bottom',
]);

const transformOriginKeywordOptions = (
	keyword: string,
): {axis: TransformOriginAxis; value: TransformOriginAxisValue}[] => {
	if (keyword === 'left') {
		return [{axis: 'x', value: {value: 0, unit: '%'}}];
	}

	if (keyword === 'right') {
		return [{axis: 'x', value: {value: 100, unit: '%'}}];
	}

	if (keyword === 'top') {
		return [{axis: 'y', value: {value: 0, unit: '%'}}];
	}

	if (keyword === 'bottom') {
		return [{axis: 'y', value: {value: 100, unit: '%'}}];
	}

	return [
		{axis: 'x', value: {value: 50, unit: '%'}},
		{axis: 'y', value: {value: 50, unit: '%'}},
	];
};

const transformOriginCenter: TransformOriginAxisValue = {value: 50, unit: '%'};

const stringifyNumber = (value: number): string => {
	return String(normalizeNumber(value));
};

class UnsupportedStringInterpolationValueError extends TypeError {}

const parseStringInterpolationComponent = (
	component: string,
	value: string,
): {
	kind: StringInterpolationKind;
	value: number;
	unit: string | null;
} => {
	const match = cssNumberRegex.exec(component);
	if (match === null) {
		throw new UnsupportedStringInterpolationValueError(
			`Cannot interpolate "${value}" because "${component}" is not a supported scale, translate, or rotate value`,
		);
	}

	const unit = match[2] ?? null;
	const numberValue = Number(match[1]);
	if (!Number.isFinite(numberValue)) {
		throw new TypeError(
			`Cannot interpolate "${value}" because "${component}" is not finite`,
		);
	}

	if (unit === null) {
		return {kind: 'scale', value: numberValue, unit: null};
	}

	if (angleUnits.has(unit)) {
		return {kind: 'rotate', value: numberValue, unit};
	}

	if (lengthUnits.has(unit)) {
		return {kind: 'translate', value: numberValue, unit};
	}

	throw new TypeError(
		`Cannot interpolate "${value}" because "${unit}" is not a supported translate or rotate unit`,
	);
};

const parseTransformOriginLengthPercentage = ({
	component,
	value,
	allowPercentage,
}: {
	component: string;
	value: string;
	allowPercentage: boolean;
}): TransformOriginAxisValue => {
	const match = cssNumberRegex.exec(component);
	if (match === null) {
		throw new TypeError(
			`Cannot interpolate "${value}" because "${component}" is not a supported transform-origin ${allowPercentage ? 'length-percentage' : 'z length'}`,
		);
	}

	const unit = match[2] ?? null;
	const numberValue = Number(match[1]);
	if (!Number.isFinite(numberValue)) {
		throw new TypeError(
			`Cannot interpolate "${value}" because "${component}" is not finite`,
		);
	}

	if (
		unit === null ||
		!lengthUnits.has(unit) ||
		(!allowPercentage && unit === '%')
	) {
		throw new TypeError(
			`Cannot interpolate "${value}" because "${component}" is not a supported transform-origin ${allowPercentage ? 'length-percentage' : 'z length'}`,
		);
	}

	return {value: numberValue, unit};
};

const parseTransformOriginToken = (
	component: string,
	value: string,
):
	| {
			type: 'keyword';
			keyword: string;
	  }
	| {
			type: 'length-percentage';
			parsed: TransformOriginAxisValue;
	  } => {
	const lower = component.toLowerCase();
	if (transformOriginKeywords.has(lower)) {
		return {type: 'keyword', keyword: lower};
	}

	return {
		type: 'length-percentage',
		parsed: parseTransformOriginLengthPercentage({
			component,
			value,
			allowPercentage: true,
		}),
	};
};

const parseTwoTransformOriginKeywords = (
	first: string,
	second: string,
	value: string,
): [TransformOriginAxisValue, TransformOriginAxisValue] => {
	const candidates: [TransformOriginAxisValue, TransformOriginAxisValue][] = [];
	for (const firstOption of transformOriginKeywordOptions(first)) {
		for (const secondOption of transformOriginKeywordOptions(second)) {
			if (firstOption.axis === secondOption.axis) {
				continue;
			}

			candidates.push(
				firstOption.axis === 'x'
					? [firstOption.value, secondOption.value]
					: [secondOption.value, firstOption.value],
			);
		}
	}

	if (candidates.length === 0) {
		throw new TypeError(
			`Cannot interpolate "${value}" because "${first} ${second}" is not a valid transform-origin keyword pair`,
		);
	}

	return candidates[0];
};

const parseTransformOriginXY = (
	parts: string[],
	value: string,
): [TransformOriginAxisValue, TransformOriginAxisValue] => {
	if (parts.length === 1) {
		const token = parseTransformOriginToken(parts[0], value);
		if (token.type === 'length-percentage') {
			return [token.parsed, transformOriginCenter];
		}

		if (token.keyword === 'top' || token.keyword === 'bottom') {
			return [
				transformOriginCenter,
				transformOriginKeywordOptions(token.keyword)[0].value,
			];
		}

		return [
			transformOriginKeywordOptions(token.keyword)[0].value,
			transformOriginCenter,
		];
	}

	const first = parseTransformOriginToken(parts[0], value);
	const second = parseTransformOriginToken(parts[1], value);

	if (
		first.type === 'length-percentage' &&
		second.type === 'length-percentage'
	) {
		return [first.parsed, second.parsed];
	}

	if (first.type === 'keyword' && second.type === 'keyword') {
		return parseTwoTransformOriginKeywords(
			first.keyword,
			second.keyword,
			value,
		);
	}

	const keyword =
		first.type === 'keyword'
			? first
			: second.type === 'keyword'
				? second
				: null;
	const length =
		first.type === 'length-percentage'
			? first.parsed
			: second.type === 'length-percentage'
				? second.parsed
				: null;
	if (keyword === null || length === null) {
		throw new Error('Expected a keyword and a length-percentage value');
	}

	const keywordIsFirst = first.type === 'keyword';

	if (keyword.keyword === 'left' || keyword.keyword === 'right') {
		if (!keywordIsFirst) {
			throw new TypeError(
				`Cannot interpolate "${value}" because horizontal transform-origin keywords must come before a length-percentage value`,
			);
		}

		return [transformOriginKeywordOptions(keyword.keyword)[0].value, length];
	}

	if (keyword.keyword === 'top' || keyword.keyword === 'bottom') {
		return [length, transformOriginKeywordOptions(keyword.keyword)[0].value];
	}

	return keywordIsFirst
		? [transformOriginCenter, length]
		: [length, transformOriginCenter];
};

const parseTransformOriginValue = (
	output: string,
	parts: string[],
): ParsedStringInterpolationValue => {
	const [x, y] = parseTransformOriginXY(parts.slice(0, 2), output);
	const z =
		parts[2] === undefined
			? {value: 0, unit: null}
			: parseTransformOriginLengthPercentage({
					component: parts[2],
					value: output,
					allowPercentage: false,
				});

	return {
		kind: 'translate',
		values: [x.value, y.value, z.value, 0],
		units: [x.unit, y.unit, z.unit, null],
		dimensions: parts[2] === undefined ? 2 : 3,
		axisRotation: false,
	};
};

const parseAxisRotationValue = (
	output: string,
): ParsedStringInterpolationValue | null => {
	const parts = output.trim().split(/\s+/);
	const keywordAxis = parts.length === 2 ? parts[0].toLowerCase() : null;
	if (keywordAxis === 'x' || keywordAxis === 'y' || keywordAxis === 'z') {
		const keywordAngle = parseStringInterpolationComponent(parts[1], output);
		if (keywordAngle.kind !== 'rotate') {
			return null;
		}

		return {
			kind: 'rotate',
			values:
				keywordAxis === 'x'
					? [1, 0, 0, keywordAngle.value]
					: keywordAxis === 'y'
						? [0, 1, 0, keywordAngle.value]
						: [0, 0, 1, keywordAngle.value],
			units: [null, null, null, keywordAngle.unit],
			dimensions: 4,
			axisRotation: true,
		};
	}

	if (parts.length !== 4) {
		return null;
	}

	const axis = parts.slice(0, 3).map(Number);
	if (!axis.every(Number.isFinite)) {
		return null;
	}

	const vectorAngle = parseStringInterpolationComponent(parts[3], output);
	if (vectorAngle.kind !== 'rotate') {
		return null;
	}

	return {
		kind: 'rotate',
		values: [axis[0], axis[1], axis[2], vectorAngle.value],
		units: [null, null, null, vectorAngle.unit],
		dimensions: 4,
		axisRotation: true,
	};
};

const parseStringInterpolationValue = (
	output: string | number,
): ParsedStringInterpolationValue => {
	if (typeof output === 'number') {
		if (!Number.isFinite(output)) {
			throw new Error(
				`outputRange must contain only finite numbers, but got [${output}]`,
			);
		}

		return {
			kind: 'scale',
			values: [output, output, 1, 0],
			units: [null, null, null, null],
			dimensions: 1,
			axisRotation: false,
		};
	}

	const axisRotation = parseAxisRotationValue(output);
	if (axisRotation !== null) {
		return axisRotation;
	}

	const parts = output.trim().split(/\s+/);
	if (parts.length < 1 || parts.length > 3 || parts[0] === '') {
		throw new TypeError(
			`String outputRange values must contain 1 to 3 components, but got "${output}"`,
		);
	}

	if (parts.some((part) => transformOriginKeywords.has(part.toLowerCase()))) {
		return parseTransformOriginValue(output, parts);
	}

	const parsed = parts.map((part) =>
		parseStringInterpolationComponent(part, output),
	);
	const [{kind}] = parsed;
	for (const part of parsed) {
		if (part.kind !== kind) {
			throw new TypeError(
				`Cannot interpolate "${output}" because it mixes ${kind} and ${part.kind} values`,
			);
		}
	}

	if (kind === 'scale') {
		const x = parsed[0].value;
		const y = parsed[1]?.value ?? x;
		const z = parsed[2]?.value ?? 1;
		return {
			kind,
			values: [x, y, z, 0],
			units: [null, null, null, null],
			dimensions: parsed.length,
			axisRotation: false,
		};
	}

	return {
		kind,
		values: [parsed[0].value, parsed[1]?.value ?? 0, parsed[2]?.value ?? 0, 0],
		units: [
			parsed[0].unit,
			parsed[1]?.unit ?? null,
			parsed[2]?.unit ?? null,
			null,
		],
		dimensions: parsed.length,
		axisRotation: false,
	};
};

const serializeStringInterpolationValue = ({
	kind,
	values,
	units,
	dimensions,
	axisRotation,
}: ParsedStringInterpolationValue): string => {
	if (axisRotation) {
		return `${stringifyNumber(values[0])} ${stringifyNumber(values[1])} ${stringifyNumber(values[2])} ${stringifyNumber(values[3])}${units[3]}`;
	}

	if (kind === 'scale') {
		return values
			.slice(0, dimensions)
			.map((value) => stringifyNumber(value))
			.join(' ');
	}

	return values
		.slice(0, dimensions)
		.map((value, index) => `${stringifyNumber(value)}${units[index]}`)
		.join(' ');
};

const toSignedArea = (scale: number): number => {
	if (scale === 0) {
		return 0;
	}

	return Math.sign(scale) * scale * scale;
};

const fromSignedArea = (area: number): number => {
	if (area === 0) {
		return 0;
	}

	return Math.sign(area) * Math.sqrt(Math.abs(area));
};

function interpolateFunction(
	input: number,
	inputRange: [number, number],
	outputRange: [number, number],
	options: InterpolateSegmentResolvedOptions,
): number {
	const {extrapolateLeft, extrapolateRight, easing, output} = options;

	let result = input;
	const [inputMin, inputMax] = inputRange;
	const [outputMin, outputMax] = outputRange;

	if (result < inputMin) {
		if (extrapolateLeft === 'identity') {
			return result;
		}

		if (extrapolateLeft === 'clamp') {
			result = inputMin;
		} else if (extrapolateLeft === 'wrap') {
			const range = inputMax - inputMin;
			result = ((((result - inputMin) % range) + range) % range) + inputMin;
		} else if (extrapolateLeft === 'extend') {
			// Noop
		}
	}

	if (result > inputMax) {
		if (extrapolateRight === 'identity') {
			return result;
		}

		if (extrapolateRight === 'clamp') {
			result = inputMax;
		} else if (extrapolateRight === 'wrap') {
			const range = inputMax - inputMin;
			result = ((((result - inputMin) % range) + range) % range) + inputMin;
		} else if (extrapolateRight === 'extend') {
			// Noop
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
	if (output === 'perceptual-scale') {
		const signedAreaMin = toSignedArea(outputMin);
		const signedAreaMax = toSignedArea(outputMax);
		result = fromSignedArea(
			result * (signedAreaMax - signedAreaMin) + signedAreaMin,
		);
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

const defaultEasing = (num: number): number => num;

const resolveOutputOption = (
	output: InterpolateOptions['output'],
): InterpolateOutputOption => {
	return output ?? 'linear';
};

const shouldExtendRightForEasing = (easing: EasingFunction): boolean => {
	return easing.remotionShouldExtendRight === true;
};

const resolveEasingForSegment = ({
	easing,
	segmentIndex,
}: {
	easing: InterpolateOptions['easing'];
	segmentIndex: number;
}): EasingFunction => {
	if (easing === undefined) {
		return defaultEasing;
	}

	if (typeof easing === 'function') {
		return easing;
	}

	// `segmentIndex` is in [0, inputRange.length - 2]; array length was validated above.
	return easing[segmentIndex] as EasingFunction;
};

const interpolateSegment = ({
	input,
	inputRange,
	outputRange,
	easing,
	extrapolateLeft,
	extrapolateRight,
	output,
}: {
	input: number;
	inputRange: [number, number];
	outputRange: [number, number];
	easing: EasingFunction;
	extrapolateLeft: ExtrapolateType;
	extrapolateRight: ExtrapolateType;
	output: InterpolateOutputOption;
}): number => {
	return interpolateFunction(input, inputRange, outputRange, {
		easing,
		extrapolateLeft,
		extrapolateRight:
			input > inputRange[1] &&
			extrapolateRight === 'clamp' &&
			shouldExtendRightForEasing(easing)
				? 'extend'
				: extrapolateRight,
		output,
	});
};

const interpolateNumber = ({
	input,
	inputRange,
	outputRange,
	options,
}: {
	input: number;
	inputRange: readonly number[];
	outputRange: readonly number[];
	options: InterpolateOptions | undefined;
}): number => {
	const output = resolveOutputOption(options?.output);

	if (inputRange.length === 1) {
		return outputRange[0];
	}

	const easingOption = options?.easing;

	let extrapolateLeft: ExtrapolateType = 'extend';
	if (options?.extrapolateLeft !== undefined) {
		extrapolateLeft = options.extrapolateLeft;
	}

	let extrapolateRight: ExtrapolateType = 'extend';
	if (options?.extrapolateRight !== undefined) {
		extrapolateRight = options.extrapolateRight;
	}

	const posterizedInput =
		options?.posterize === undefined
			? input
			: Math.floor(input / options.posterize) * options.posterize;
	const range = findRange(posterizedInput, inputRange);
	const easing = resolveEasingForSegment({
		easing: easingOption,
		segmentIndex: range,
	});
	let result = interpolateSegment({
		input: posterizedInput,
		inputRange: [inputRange[range], inputRange[range + 1]],
		outputRange: [outputRange[range], outputRange[range + 1]],
		easing,
		extrapolateLeft,
		extrapolateRight,
		output,
	});

	for (let segmentIndex = 0; segmentIndex < range; segmentIndex++) {
		const previousEasing = resolveEasingForSegment({
			easing: easingOption,
			segmentIndex,
		});
		if (!shouldExtendRightForEasing(previousEasing)) {
			continue;
		}

		const previousSegmentEnd = inputRange[segmentIndex + 1];
		if (posterizedInput <= previousSegmentEnd) {
			continue;
		}

		const continuedSegmentValue = interpolateSegment({
			input: posterizedInput,
			inputRange: [inputRange[segmentIndex], previousSegmentEnd],
			outputRange: [outputRange[segmentIndex], outputRange[segmentIndex + 1]],
			easing: previousEasing,
			extrapolateLeft,
			extrapolateRight: 'extend',
			output,
		});
		result += continuedSegmentValue - outputRange[segmentIndex + 1];
	}

	return result;
};

const interpolateString = ({
	input,
	inputRange,
	outputRange,
	options,
}: {
	input: number;
	inputRange: readonly number[];
	outputRange: readonly (string | number)[];
	options: InterpolateOptions | undefined;
}): string => {
	const initiallyParsedOutputRange = outputRange.map(
		parseStringInterpolationValue,
	);
	const hasAxisRotation = initiallyParsedOutputRange.some(
		(parsed) => parsed.axisRotation,
	);
	const posterizedInput =
		options?.posterize === undefined
			? input
			: Math.floor(input / options.posterize) * options.posterize;
	const segmentIndex =
		inputRange.length === 1 ? 0 : findRange(posterizedInput, inputRange);
	const parsedOutputRange = hasAxisRotation
		? initiallyParsedOutputRange.map((parsed, index) => {
				if (parsed.kind !== 'rotate') {
					return parsed;
				}

				if (parsed.axisRotation) {
					return parsed;
				}

				if (parsed.dimensions !== 1) {
					throw new TypeError(
						'Cannot interpolate a multi-angle rotate value with an axis rotation',
					);
				}

				// A zero-degree rotation is the identity regardless of its axis. Reusing
				// the active neighbor's axis prevents the axis from drifting while the
				// angle interpolates away from zero.
				const adjacentAxisRotation =
					parsed.values[0] === 0
						? index === segmentIndex
							? initiallyParsedOutputRange[index + 1]
							: index === segmentIndex + 1
								? initiallyParsedOutputRange[index - 1]
								: undefined
						: undefined;
				const axis = adjacentAxisRotation?.axisRotation
					? adjacentAxisRotation.values
					: ([0, 0, 1] as const);

				return {
					kind: 'rotate' as const,
					values: [axis[0], axis[1], axis[2], parsed.values[0]] as [
						number,
						number,
						number,
						number,
					],
					units: [null, null, null, parsed.units[0]] as [
						null,
						null,
						null,
						string | null,
					],
					dimensions: 4,
					axisRotation: true,
				};
			})
		: initiallyParsedOutputRange;
	const kind = parsedOutputRange[0]?.kind;
	if (kind === undefined) {
		throw new Error('outputRange must have at least 1 element');
	}

	for (const parsed of parsedOutputRange) {
		if (parsed.kind !== kind) {
			throw new TypeError(
				`Cannot interpolate ${kind} values with ${parsed.kind} values`,
			);
		}
	}

	const dimensions = Math.max(
		...parsedOutputRange.map((parsed) => parsed.dimensions),
	);
	const units: [string | null, string | null, string | null, string | null] = [
		null,
		null,
		null,
		null,
	];

	if (kind !== 'scale') {
		for (let axis = 0; axis < dimensions; axis++) {
			if (hasAxisRotation && axis < 3) {
				continue;
			}

			for (const parsed of parsedOutputRange) {
				const unit = parsed.units[axis];
				if (unit === null) {
					continue;
				}

				if (units[axis] === null) {
					units[axis] = unit;
					continue;
				}

				if (units[axis] !== unit) {
					throw new TypeError(
						`Cannot interpolate ${kind} values with different units on axis ${axis + 1}: ${units[axis]} and ${unit}`,
					);
				}
			}

			if (units[axis] === null) {
				throw new TypeError(
					`Cannot interpolate ${kind} values because axis ${axis + 1} has no unit`,
				);
			}
		}
	}

	const values: [number, number, number, number] = [0, 0, 0, 0];
	for (let axis = 0; axis < dimensions; axis++) {
		values[axis] = interpolateNumber({
			input,
			inputRange,
			outputRange: parsedOutputRange.map((parsed) => parsed.values[axis]),
			options,
		});
	}

	return serializeStringInterpolationValue({
		kind,
		values,
		units,
		dimensions,
		axisRotation: hasAxisRotation,
	});
};

const interpolateDiscreteString = ({
	input,
	inputRange,
	outputRange,
	options,
}: {
	input: number;
	inputRange: readonly number[];
	outputRange: readonly string[];
	options: InterpolateOptions | undefined;
}): string => {
	if (inputRange.length === 1) {
		return outputRange[0];
	}

	for (
		let segmentIndex = 0;
		segmentIndex < inputRange.length - 1;
		segmentIndex++
	) {
		if (
			resolveEasingForSegment({
				easing: options?.easing,
				segmentIndex,
			}) !== Easing.step1
		) {
			throw new TypeError(
				'Non-numeric strings can only be interpolated using Easing.step1',
			);
		}
	}

	const posterizedInput =
		options?.posterize === undefined
			? input
			: Math.floor(input / options.posterize) * options.posterize;
	const inputMin = inputRange[0];
	const inputMax = inputRange[inputRange.length - 1];
	let resolvedInput = posterizedInput;

	if (resolvedInput < inputMin) {
		if (options?.extrapolateLeft === 'identity') {
			throw new TypeError(
				'extrapolateLeft: "identity" is not supported for non-numeric strings',
			);
		}

		if (options?.extrapolateLeft === 'wrap') {
			const wrapRange = inputMax - inputMin;
			resolvedInput =
				((((resolvedInput - inputMin) % wrapRange) + wrapRange) % wrapRange) +
				inputMin;
		} else {
			return outputRange[0];
		}
	}

	if (resolvedInput > inputMax) {
		if (options?.extrapolateRight === 'identity') {
			throw new TypeError(
				'extrapolateRight: "identity" is not supported for non-numeric strings',
			);
		}

		if (options?.extrapolateRight === 'wrap') {
			const wrapRange = inputMax - inputMin;
			resolvedInput =
				((((resolvedInput - inputMin) % wrapRange) + wrapRange) % wrapRange) +
				inputMin;
		} else {
			return outputRange[outputRange.length - 1];
		}
	}

	const range = findRange(resolvedInput, inputRange);
	return resolvedInput >= inputRange[range + 1]
		? outputRange[range + 1]
		: outputRange[range];
};

const validateTupleOutputRange = (
	outputRange: readonly (readonly unknown[])[],
): number => {
	const dimensions = outputRange[0]?.length;
	if (dimensions === undefined) {
		throw new Error('outputRange must have at least 1 element');
	}

	if (dimensions === 0) {
		throw new TypeError('outputRange tuples must contain at least 1 number');
	}

	for (const output of outputRange) {
		if (output.length !== dimensions) {
			throw new TypeError(
				`outputRange tuples must all have the same length, but got ${dimensions} and ${output.length}`,
			);
		}

		for (const value of output) {
			if (typeof value !== 'number' || !Number.isFinite(value)) {
				throw new TypeError(
					`outputRange tuples must contain only finite numbers, but got [${output.join(
						',',
					)}]`,
				);
			}
		}
	}

	return dimensions;
};

const interpolateTuple = ({
	input,
	inputRange,
	outputRange,
	options,
}: {
	input: number;
	inputRange: readonly number[];
	outputRange: readonly (readonly unknown[])[];
	options: InterpolateOptions | undefined;
}): number[] => {
	const dimensions = validateTupleOutputRange(outputRange);

	return new Array(dimensions).fill(true).map((_, axis) =>
		interpolateNumber({
			input,
			inputRange,
			outputRange: outputRange.map((output) => output[axis] as number),
			options,
		}),
	);
};

function checkValidInputRange(arr: readonly number[]) {
	for (let i = 1; i < arr.length; ++i) {
		if (!(arr[i] > arr[i - 1])) {
			throw new Error(
				`inputRange must be strictly monotonically increasing but got [${arr.join(
					',',
				)}]`,
			);
		}
	}
}

function checkInfiniteRange(name: string, arr: readonly number[]) {
	if (arr.length < 1) {
		throw new Error(name + ' must have at least 1 element');
	}

	for (const element of arr) {
		if (typeof element !== 'number') {
			throw new Error(`${name} must contain only numbers`);
		}

		if (!Number.isFinite(element)) {
			throw new Error(
				`${name} must contain only finite numbers, but got [${arr.join(',')}]`,
			);
		}
	}
}

export function assertValidInterpolateEasingOption(
	easing: EasingFunction | readonly EasingFunction[] | undefined,
	inputRangeLength: number,
) {
	if (easing === undefined) {
		return;
	}

	if (typeof easing === 'function') {
		return;
	}

	const expectedLength = inputRangeLength - 1;
	if (easing.length !== expectedLength) {
		throw new Error(
			`When easing is an array, it must have one entry per segment between keyframes (length inputRange.length - 1 = ${expectedLength}), but got length ${easing.length}`,
		);
	}

	for (let i = 0; i < easing.length; i++) {
		if (typeof easing[i] !== 'function') {
			throw new Error(`easing[${i}] must be a function`);
		}
	}
}

export function assertValidInterpolatePosterizeOption(
	posterize: number | undefined,
) {
	if (posterize === undefined) {
		return;
	}

	if (
		typeof posterize !== 'number' ||
		!Number.isFinite(posterize) ||
		posterize <= 0
	) {
		throw new Error(
			`posterize must be a positive finite number, but got ${posterize}`,
		);
	}
}

function assertValidInterpolateOutputOption(
	output: InterpolateOptions['output'],
) {
	if (
		output === undefined ||
		output === 'linear' ||
		output === 'perceptual-scale'
	) {
		return;
	}

	throw new Error(
		`output must be "linear" or "perceptual-scale", but got ${String(output)}`,
	);
}

/*
 * @description Allows you to map a range of values to another using a concise syntax.
 * @see [Documentation](https://remotion.dev/docs/interpolate)
 */
/* eslint-disable no-redeclare */
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly number[],
	options?: InterpolateOptions,
): number;
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly string[],
	options?: InterpolateOptions,
): string;
export function interpolate<const Tuple extends NumericTuple>(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly Tuple[],
	options?: InterpolateOptions,
): WidenNumericTuple<Tuple>;
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly (readonly number[])[],
	options?: InterpolateOptions,
): number[];
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly (number | string | readonly number[])[],
	options?: InterpolateOptions,
): number | string | readonly number[];
export function interpolate(
	input: number,
	inputRange: readonly number[],
	outputRange: readonly InterpolateOutputValue[],
	options?: InterpolateOptions,
): number | string | readonly number[] {
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
				') must have the same length',
		);
	}

	checkInfiniteRange('inputRange', inputRange);
	checkValidInputRange(inputRange);

	assertValidInterpolateEasingOption(options?.easing, inputRange.length);
	assertValidInterpolatePosterizeOption(options?.posterize);
	assertValidInterpolateOutputOption(options?.output);

	if (typeof input !== 'number') {
		throw new TypeError('Cannot interpolate an input which is not a number');
	}

	if (!Array.isArray(outputRange)) {
		throw new Error('outputRange must contain only numbers');
	}

	const hasStringOutput = outputRange.some(
		(output) => typeof output === 'string',
	);
	if (hasStringOutput) {
		if (
			!outputRange.every(
				(output) => typeof output === 'string' || typeof output === 'number',
			)
		) {
			throw new TypeError(
				'outputRange must contain only numbers, or supported scale, translate, and rotate strings',
			);
		}

		try {
			return interpolateString({input, inputRange, outputRange, options});
		} catch (error) {
			if (!outputRange.every((output) => typeof output === 'string')) {
				throw error;
			}

			const hasNonNumericString = outputRange.some((output) => {
				try {
					parseStringInterpolationValue(output);
					return false;
				} catch (parseError) {
					return parseError instanceof UnsupportedStringInterpolationValueError;
				}
			});
			if (!hasNonNumericString) {
				throw error;
			}

			return interpolateDiscreteString({
				input,
				inputRange,
				outputRange,
				options,
			});
		}
	}

	if (outputRange.every((output) => Array.isArray(output))) {
		return interpolateTuple({input, inputRange, outputRange, options});
	}

	if (!outputRange.every((output) => typeof output === 'number')) {
		throw new TypeError(
			'outputRange must contain only numbers, numeric tuples, or supported scale, translate, and rotate strings',
		);
	}

	checkInfiniteRange('outputRange', outputRange);

	return interpolateNumber({input, inputRange, outputRange, options});
}
/* eslint-enable no-redeclare */
