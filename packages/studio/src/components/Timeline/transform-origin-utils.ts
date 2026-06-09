import {
	normalizeTimelineNumber,
	roundToDecimalPlaces,
} from './timeline-field-utils';

export type TransformOriginUnit = '%' | 'px';

export type TransformOriginAxisValue = {
	readonly value: number;
	readonly unit: TransformOriginUnit;
};

export type ParsedTransformOrigin = {
	readonly x: TransformOriginAxisValue;
	readonly y: TransformOriginAxisValue;
	readonly z: string | null;
};

const cssNumberWithUnit = /^([+-]?(?:\d+\.?\d*|\.\d+))(px|%)$/i;
const cssLength = /^([+-]?(?:\d+\.?\d*|\.\d+))[a-zA-Z]+$/;
const keywords = new Set(['left', 'center', 'right', 'top', 'bottom']);

const center: TransformOriginAxisValue = {value: 50, unit: '%'};

const keywordOptions = (
	keyword: string,
): {
	readonly axis: 'x' | 'y';
	readonly value: TransformOriginAxisValue;
}[] => {
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
		{axis: 'x', value: center},
		{axis: 'y', value: center},
	];
};

const parseLengthPercentage = (
	token: string,
): TransformOriginAxisValue | null => {
	const match = cssNumberWithUnit.exec(token);
	if (!match) {
		return null;
	}

	const value = Number(match[1]);
	if (!Number.isFinite(value)) {
		return null;
	}

	return {value, unit: match[2].toLowerCase() as TransformOriginUnit};
};

const parseToken = (
	token: string,
):
	| {readonly type: 'keyword'; readonly keyword: string}
	| {
			readonly type: 'length-percentage';
			readonly value: TransformOriginAxisValue;
	  }
	| null => {
	const lower = token.toLowerCase();
	if (keywords.has(lower)) {
		return {type: 'keyword', keyword: lower};
	}

	const value = parseLengthPercentage(token);
	return value === null ? null : {type: 'length-percentage', value};
};

const parseTwoKeywords = (
	first: string,
	second: string,
): readonly [TransformOriginAxisValue, TransformOriginAxisValue] | null => {
	const candidates: [TransformOriginAxisValue, TransformOriginAxisValue][] = [];
	for (const firstOption of keywordOptions(first)) {
		for (const secondOption of keywordOptions(second)) {
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

	return candidates[0] ?? null;
};

const parseXY = (
	parts: readonly [string] | readonly [string, string],
): readonly [TransformOriginAxisValue, TransformOriginAxisValue] | null => {
	if (parts.length === 1) {
		const token = parseToken(parts[0]);
		if (token === null) {
			return null;
		}

		if (token.type === 'length-percentage') {
			return [token.value, center];
		}

		if (token.keyword === 'top' || token.keyword === 'bottom') {
			return [center, keywordOptions(token.keyword)[0].value];
		}

		return [keywordOptions(token.keyword)[0].value, center];
	}

	const first = parseToken(parts[0]);
	const second = parseToken(parts[1]);
	if (first === null || second === null) {
		return null;
	}

	if (
		first.type === 'length-percentage' &&
		second.type === 'length-percentage'
	) {
		return [first.value, second.value];
	}

	if (first.type === 'keyword' && second.type === 'keyword') {
		return parseTwoKeywords(first.keyword, second.keyword);
	}

	const keyword =
		first.type === 'keyword'
			? first
			: second.type === 'keyword'
				? second
				: null;
	const length =
		first.type === 'length-percentage'
			? first.value
			: second.type === 'length-percentage'
				? second.value
				: null;
	if (keyword === null || length === null) {
		return null;
	}

	const keywordIsFirst = first.type === 'keyword';

	if (keyword.keyword === 'left' || keyword.keyword === 'right') {
		return keywordIsFirst
			? [keywordOptions(keyword.keyword)[0].value, length]
			: null;
	}

	if (keyword.keyword === 'top' || keyword.keyword === 'bottom') {
		return [length, keywordOptions(keyword.keyword)[0].value];
	}

	return keywordIsFirst ? [center, length] : [length, center];
};

const isSupportedZ = (token: string): boolean => {
	if (token.includes('%')) {
		return false;
	}

	return cssLength.test(token);
};

export const parseTransformOrigin = (
	value: unknown,
): ParsedTransformOrigin | null => {
	if (typeof value !== 'string') {
		return null;
	}

	const parts = value.trim().split(/\s+/);
	if (parts.length < 1 || parts.length > 3 || parts[0] === '') {
		return null;
	}

	const xy = parseXY(parts.length === 1 ? [parts[0]] : [parts[0], parts[1]]);
	if (xy === null) {
		return null;
	}

	const z = parts[2] ?? null;
	if (z !== null && !isSupportedZ(z)) {
		return null;
	}

	return {x: xy[0], y: xy[1], z};
};

export const axisValueToUv = (
	axis: TransformOriginAxisValue,
	size: number,
): number | null => {
	if (!Number.isFinite(size) || size <= 0) {
		return null;
	}

	if (axis.unit === '%') {
		return axis.value / 100;
	}

	return axis.value / size;
};

export const parsedTransformOriginToUv = ({
	parsed,
	width,
	height,
}: {
	readonly parsed: ParsedTransformOrigin;
	readonly width: number;
	readonly height: number;
}): readonly [number, number] | null => {
	const x = axisValueToUv(parsed.x, width);
	const y = axisValueToUv(parsed.y, height);
	return x === null || y === null ? null : [x, y];
};

const formatPercent = (value: number, decimalPlaces: number): string => {
	const rounded = roundToDecimalPlaces(
		normalizeTimelineNumber(value * 100),
		decimalPlaces,
	);
	return String(Object.is(rounded, -0) ? 0 : rounded);
};

export const serializeTransformOrigin = ({
	uv,
	z,
	decimalPlaces = 2,
}: {
	readonly uv: readonly [number, number];
	readonly z: string | null;
	readonly decimalPlaces?: number;
}): string => {
	const xy = `${formatPercent(uv[0], decimalPlaces)}% ${formatPercent(
		uv[1],
		decimalPlaces,
	)}%`;
	return z === null ? xy : `${xy} ${z}`;
};

export const parsedTransformOriginToPercent = (
	parsed: ParsedTransformOrigin,
): readonly [number, number] | null => {
	if (parsed.x.unit !== '%' || parsed.y.unit !== '%') {
		return null;
	}

	return [parsed.x.value, parsed.y.value];
};

export const transformOriginPercentToUv = (
	percent: readonly [number, number],
): readonly [number, number] => [percent[0] / 100, percent[1] / 100];
