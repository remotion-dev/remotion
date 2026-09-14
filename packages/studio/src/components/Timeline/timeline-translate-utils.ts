import {
	normalizeTimelineNumber,
	roundToDecimalPlaces,
} from './timeline-field-utils';

const TRANSLATE_PATTERN =
	/^(-?\d+(?:\.\d+)?)(px|%)(?:\s+(-?\d+(?:\.\d+)?)(px|%))?(?:\s+(-?\d+(?:\.\d+)?)(px))?$/i;
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

	return [
		{
			value: normalizeTimelineNumber(Number(match[1])),
			unit: match[2].toLowerCase() as TranslateUnit,
		},
		{
			value:
				match[3] === undefined ? 0 : normalizeTimelineNumber(Number(match[3])),
			unit:
				match[4] === undefined
					? 'px'
					: (match[4].toLowerCase() as TranslateUnit),
		},
		match[5] === undefined
			? null
			: {
					value: normalizeTimelineNumber(Number(match[5])),
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
