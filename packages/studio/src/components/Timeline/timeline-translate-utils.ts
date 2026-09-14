import {
	normalizeTimelineNumber,
	roundToDecimalPlaces,
} from './timeline-field-utils';

const TRANSLATE_PATTERN =
	/^(-?\d+(?:\.\d+)?)(px|%)?(?:\s+(-?\d+(?:\.\d+)?)(px|%)?)?(?:\s+(-?\d+(?:\.\d+)?)(px)?)?$/i;
const translateDecimalPlaces = 1;

export type ParsedTranslate = readonly [number, number, number | null];

export type TranslateUnit = 'px' | '%';

export type ParsedTranslateWithUnits = readonly [
	{readonly value: number; readonly unit: TranslateUnit},
	{readonly value: number; readonly unit: TranslateUnit},
	{readonly value: number; readonly unit: 'px'} | null,
];

export const parseTranslateWithUnits = (
	value: string,
): ParsedTranslateWithUnits | null => {
	const match = value.match(TRANSLATE_PATTERN);
	if (!match) {
		return null;
	}

	const x = normalizeTimelineNumber(Number(match[1]));
	const y =
		match[3] === undefined ? 0 : normalizeTimelineNumber(Number(match[3]));
	const z =
		match[5] === undefined ? null : normalizeTimelineNumber(Number(match[5]));

	if (
		(match[2] === undefined && x !== 0) ||
		(match[3] !== undefined && match[4] === undefined && y !== 0) ||
		(match[5] !== undefined && match[6] === undefined && z !== 0)
	) {
		return null;
	}

	return [
		{
			value: x,
			unit:
				match[2] === undefined
					? 'px'
					: (match[2].toLowerCase() as TranslateUnit),
		},
		{
			value: y,
			unit:
				match[4] === undefined
					? 'px'
					: (match[4].toLowerCase() as TranslateUnit),
		},
		z === null
			? z
			: {
					value: z,
					unit: 'px',
				},
	];
};

export const parseTranslate = (value: string): ParsedTranslate => {
	const parsed = parseTranslateWithUnits(value);
	if (parsed === null || parsed[0].unit !== 'px' || parsed[1].unit !== 'px') {
		return [0, 0, null];
	}

	return [parsed[0].value, parsed[1].value, parsed[2]?.value ?? null];
};

const formatTranslateCoordinate = (
	value: number,
	decimalPlaces: number,
): string => {
	const normalized = normalizeTimelineNumber(value);
	const rounded = roundToDecimalPlaces(normalized, decimalPlaces);
	return String(Object.is(rounded, -0) ? 0 : rounded);
};

export const serializeTranslate = (
	[x, y, z]: ParsedTranslate,
	decimalPlaces = translateDecimalPlaces,
): string => {
	return serializeTranslateWithUnits(
		[
			{value: x, unit: 'px'},
			{value: y, unit: 'px'},
			z === null ? null : {value: z, unit: 'px'},
		],
		decimalPlaces,
	);
};

export const serializeTranslateWithUnits = (
	[x, y, z]: ParsedTranslateWithUnits,
	decimalPlaces = translateDecimalPlaces,
): string => {
	const xy = `${formatTranslateCoordinate(x.value, decimalPlaces)}${x.unit} ${formatTranslateCoordinate(y.value, decimalPlaces)}${y.unit}`;
	return z === null
		? xy
		: `${xy} ${formatTranslateCoordinate(z.value, decimalPlaces)}${z.unit}`;
};
