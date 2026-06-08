import {
	normalizeTimelineNumber,
	roundToDecimalPlaces,
} from './timeline-field-utils';

export type TransformOriginUnit = '%' | 'px';

export type TransformOriginCoordinate = {
	readonly value: number;
	readonly unit: TransformOriginUnit;
};

export type ParsedTransformOrigin = {
	readonly x: TransformOriginCoordinate;
	readonly y: TransformOriginCoordinate;
	readonly z: string | null;
};

const center: TransformOriginCoordinate = {value: 50, unit: '%'};
const coordinatePattern = /^([+-]?(?:\d+\.?\d*|\.\d+))(px|%)?$/;

const horizontalKeywords: Record<string, TransformOriginCoordinate> = {
	left: {value: 0, unit: '%'},
	center,
	right: {value: 100, unit: '%'},
};

const verticalKeywords: Record<string, TransformOriginCoordinate> = {
	top: {value: 0, unit: '%'},
	center,
	bottom: {value: 100, unit: '%'},
};

const parseCoordinate = (token: string): TransformOriginCoordinate | null => {
	const match = token.match(coordinatePattern);
	if (!match) {
		return null;
	}

	return {
		value: normalizeTimelineNumber(Number(match[1])),
		unit: match[2] === '%' ? '%' : 'px',
	};
};

const parseToken = (token: string) => {
	const lower = token.toLowerCase();

	return {
		coordinate: parseCoordinate(lower),
		horizontal: horizontalKeywords[lower] ?? null,
		vertical: verticalKeywords[lower] ?? null,
	};
};

const defaultTransformOrigin = (): ParsedTransformOrigin => ({
	x: center,
	y: center,
	z: null,
});

export const parseTransformOrigin = (value: string): ParsedTransformOrigin => {
	const parts = value.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return defaultTransformOrigin();
	}

	const z = parts.length >= 3 ? parts[2] : null;

	if (parts.length === 1) {
		const token = parseToken(parts[0]);
		if (token.coordinate) {
			return {x: token.coordinate, y: center, z};
		}

		if (token.horizontal) {
			return {x: token.horizontal, y: center, z};
		}

		if (token.vertical) {
			return {x: center, y: token.vertical, z};
		}

		return defaultTransformOrigin();
	}

	const first = parseToken(parts[0]);
	const second = parseToken(parts[1]);

	if (first.coordinate && second.coordinate) {
		return {x: first.coordinate, y: second.coordinate, z};
	}

	if (first.coordinate) {
		return {
			x: first.coordinate,
			y: second.vertical ?? center,
			z,
		};
	}

	if (second.coordinate) {
		if (first.vertical && !first.horizontal) {
			return {x: second.coordinate, y: first.vertical, z};
		}

		return {
			x: first.horizontal ?? center,
			y: second.coordinate,
			z,
		};
	}

	if (first.vertical && second.horizontal && !first.horizontal) {
		return {x: second.horizontal, y: first.vertical, z};
	}

	if (first.horizontal && second.vertical) {
		return {x: first.horizontal, y: second.vertical, z};
	}

	if (first.vertical && second.horizontal) {
		return {x: second.horizontal, y: first.vertical, z};
	}

	return {
		x: first.horizontal ?? second.horizontal ?? center,
		y: first.vertical ?? second.vertical ?? center,
		z,
	};
};

const formatTransformOriginCoordinate = ({
	value,
	unit,
	decimalPlaces,
}: TransformOriginCoordinate & {
	readonly decimalPlaces: number;
}): string => {
	const normalized = normalizeTimelineNumber(value);
	const rounded = roundToDecimalPlaces(normalized, decimalPlaces);
	return `${String(Object.is(rounded, -0) ? 0 : rounded)}${unit}`;
};

export const serializeTransformOrigin = ({
	x,
	y,
	z,
	decimalPlaces = 1,
}: ParsedTransformOrigin & {
	readonly decimalPlaces?: number;
}): string => {
	const serialized = `${formatTransformOriginCoordinate({
		...x,
		decimalPlaces,
	})} ${formatTransformOriginCoordinate({...y, decimalPlaces})}`;

	return z === null ? serialized : `${serialized} ${z}`;
};
