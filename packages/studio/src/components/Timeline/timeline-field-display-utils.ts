import type {InteractivitySchemaField} from 'remotion';
import {
	formatTimelineNumber,
	getDecimalPlaces,
	getTimelineDisplayDecimalPlaces,
	normalizeTimelineNumber,
	roundToDecimalPlaces,
} from './timeline-field-utils';
import {parseCssRotationToDegrees} from './timeline-rotation-utils';
import {parseTranslate, serializeTranslate} from './timeline-translate-utils';
import {parseTransformOrigin} from './transform-origin-utils';

const DISPLAY_FALLBACK_DECIMAL_PLACES = 3;
const DEFAULT_SCALE_VALUE: readonly [number, number, number] = [1, 1, 1];

const getFiniteNumericValue = (value: unknown): number | null => {
	if (typeof value !== 'number' && typeof value !== 'string') {
		return null;
	}

	const numericValue = Number(value);
	return Number.isFinite(numericValue) ? numericValue : null;
};

const parseScaleStringForDisplay = (
	value: string,
): readonly [number, number, number] | null => {
	const parts = value.trim().split(/\s+/);
	if (parts.length < 1 || parts.length > 3 || parts[0] === '') {
		return null;
	}

	const parsed = parts.map((part) => Number(part));
	if (!parsed.every((part) => Number.isFinite(part))) {
		return null;
	}

	const x = parsed[0];
	const y = parsed[1] ?? x;
	const z = parsed[2] ?? 1;

	return [x, y, z];
};

const parseScaleValueForDisplay = (
	value: unknown,
): readonly [number, number, number] => {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? [value, value, 1] : DEFAULT_SCALE_VALUE;
	}

	if (typeof value === 'string') {
		return parseScaleStringForDisplay(value) ?? DEFAULT_SCALE_VALUE;
	}

	return DEFAULT_SCALE_VALUE;
};

const formatUnknownNumberForDisplay = (value: number): string => {
	if (!Number.isFinite(value)) {
		return String(value);
	}

	return formatTimelineNumber({
		decimalPlaces: DISPLAY_FALLBACK_DECIMAL_PLACES,
		fixed: false,
		value: normalizeTimelineNumber(value),
	});
};

const normalizeUnknownForDisplay = (value: unknown): unknown => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return roundToDecimalPlaces(
			normalizeTimelineNumber(value),
			DISPLAY_FALLBACK_DECIMAL_PLACES,
		);
	}

	if (Array.isArray(value)) {
		return value.map(normalizeUnknownForDisplay);
	}

	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				normalizeUnknownForDisplay(item),
			]),
		);
	}

	return value;
};

const formatUnknownTimelineValueForDisplay = (value: unknown): string => {
	if (typeof value === 'number') {
		return formatUnknownNumberForDisplay(value);
	}

	if (
		value === null ||
		typeof value === 'string' ||
		typeof value === 'boolean' ||
		typeof value === 'bigint'
	) {
		return String(value);
	}

	if (value === undefined) {
		return 'undefined';
	}

	try {
		return JSON.stringify(normalizeUnknownForDisplay(value)) ?? String(value);
	} catch {
		return String(value);
	}
};

const formatNumberTimelineFieldValueForDisplay = ({
	fieldSchema,
	value,
}: {
	readonly fieldSchema: Extract<InteractivitySchemaField, {type: 'number'}>;
	readonly value: unknown;
}): string | null => {
	const numericValue = getFiniteNumericValue(value);
	if (numericValue === null) {
		return null;
	}

	const stepDecimals =
		fieldSchema.step === undefined ? null : getDecimalPlaces(fieldSchema.step);

	if (stepDecimals === null) {
		const digits = getDecimalPlaces(numericValue);
		return digits === 0 ? String(numericValue) : numericValue.toFixed(digits);
	}

	return formatTimelineNumber({
		decimalPlaces: stepDecimals,
		fixed: true,
		value: numericValue,
	});
};

const formatRotationTimelineFieldValueForDisplay = ({
	fieldSchema,
	value,
}: {
	readonly fieldSchema: Extract<
		InteractivitySchemaField,
		{type: 'rotation-css'} | {type: 'rotation-degrees'}
	>;
	readonly value: unknown;
}): string | null => {
	const configuredStep =
		fieldSchema.type === 'rotation-css' ||
		fieldSchema.type === 'rotation-degrees'
			? fieldSchema.step
			: undefined;
	const decimalPlaces = getTimelineDisplayDecimalPlaces({
		defaultDecimalPlaces: 1,
		step: configuredStep,
	});
	const degrees =
		fieldSchema.type === 'rotation-css'
			? parseCssRotationToDegrees(String(value ?? '0deg'))
			: getFiniteNumericValue(value);

	if (degrees === null || !Number.isFinite(degrees)) {
		return null;
	}

	return `${formatTimelineNumber({
		decimalPlaces,
		fixed: false,
		value: normalizeTimelineNumber(degrees),
	})}\u00B0`;
};

const formatScaleTimelineFieldValueForDisplay = ({
	fieldSchema,
	value,
}: {
	readonly fieldSchema: Extract<InteractivitySchemaField, {type: 'scale'}>;
	readonly value: unknown;
}): string => {
	const decimalPlaces = getTimelineDisplayDecimalPlaces({
		defaultDecimalPlaces: 3,
		step: fieldSchema.step,
	});
	const formatScalePart = (part: number) =>
		formatTimelineNumber({
			decimalPlaces,
			fixed: true,
			value: part,
		});
	const [x, y, z] = parseScaleValueForDisplay(value);
	const parts = x === y && z === 1 ? [x] : z === 1 ? [x, y] : [x, y, z];

	return parts.map(formatScalePart).join(' ');
};

const formatTranslateCoordinateForDisplay = (
	value: number,
	decimalPlaces: number,
) =>
	`${formatTimelineNumber({
		decimalPlaces,
		fixed: false,
		value,
	})}px`;

const formatTranslateTimelineFieldValueForDisplay = ({
	fieldSchema,
	value,
}: {
	readonly fieldSchema: Extract<InteractivitySchemaField, {type: 'translate'}>;
	readonly value: unknown;
}): string | null => {
	const decimalPlaces = getTimelineDisplayDecimalPlaces({
		defaultDecimalPlaces: 1,
		step: fieldSchema.step,
	});
	const numericValue = getFiniteNumericValue(value);

	if (numericValue !== null) {
		return formatTranslateCoordinateForDisplay(numericValue, decimalPlaces);
	}

	const [x, y] = parseTranslate(String(value ?? '0px 0px'));
	return serializeTranslate(x, y, decimalPlaces);
};

const formatTransformOriginAxisValueForDisplay = ({
	decimalPlaces,
	unit,
	value,
}: {
	readonly decimalPlaces: number;
	readonly unit: '%' | 'px';
	readonly value: number;
}) => {
	return `${formatTimelineNumber({
		decimalPlaces,
		fixed: false,
		value,
	})}${unit}`;
};

const formatTransformOriginTimelineFieldValueForDisplay = ({
	fieldSchema,
	value,
}: {
	readonly fieldSchema: Extract<
		InteractivitySchemaField,
		{type: 'transform-origin'}
	>;
	readonly value: unknown;
}): string | null => {
	const decimalPlaces = getTimelineDisplayDecimalPlaces({
		defaultDecimalPlaces: 2,
		step: fieldSchema.step,
	});
	const numericValue = getFiniteNumericValue(value);

	if (numericValue !== null) {
		return formatTransformOriginAxisValueForDisplay({
			decimalPlaces,
			unit: '%',
			value: numericValue,
		});
	}

	const parsed = parseTransformOrigin(value);
	if (parsed === null) {
		return null;
	}

	const xy = `${formatTransformOriginAxisValueForDisplay({
		decimalPlaces,
		unit: parsed.x.unit,
		value: parsed.x.value,
	})} ${formatTransformOriginAxisValueForDisplay({
		decimalPlaces,
		unit: parsed.y.unit,
		value: parsed.y.value,
	})}`;

	return parsed.z === null ? xy : `${xy} ${parsed.z}`;
};

const formatUvCoordinatePartForDisplay = (
	value: number,
	decimalPlaces: number,
) =>
	formatTimelineNumber({
		decimalPlaces,
		fixed: true,
		value,
	});

const formatUvCoordinateTimelineFieldValueForDisplay = ({
	fieldSchema,
	value,
}: {
	readonly fieldSchema: Extract<
		InteractivitySchemaField,
		{type: 'uv-coordinate'}
	>;
	readonly value: unknown;
}): string | null => {
	const decimalPlaces = getTimelineDisplayDecimalPlaces({
		defaultDecimalPlaces: 2,
		step: fieldSchema.step,
	});
	const numericValue = getFiniteNumericValue(value);

	if (numericValue !== null) {
		return formatUvCoordinatePartForDisplay(numericValue, decimalPlaces);
	}

	if (
		!Array.isArray(value) ||
		value.length !== 2 ||
		!value.every((item) => typeof item === 'number' && Number.isFinite(item))
	) {
		return null;
	}

	return `${formatUvCoordinatePartForDisplay(
		value[0],
		decimalPlaces,
	)}, ${formatUvCoordinatePartForDisplay(value[1], decimalPlaces)}`;
};

export const formatTimelineFieldValueForDisplay = ({
	fieldSchema,
	value,
}: {
	readonly fieldSchema: InteractivitySchemaField | undefined;
	readonly value: unknown;
}): string => {
	if (!fieldSchema) {
		return formatUnknownTimelineValueForDisplay(value);
	}

	if (value === undefined) {
		return 'unset';
	}

	switch (fieldSchema.type) {
		case 'number':
			return (
				formatNumberTimelineFieldValueForDisplay({fieldSchema, value}) ??
				formatUnknownTimelineValueForDisplay(value)
			);

		case 'rotation-css':
		case 'rotation-degrees':
			return (
				formatRotationTimelineFieldValueForDisplay({fieldSchema, value}) ??
				formatUnknownTimelineValueForDisplay(value)
			);

		case 'scale':
			return formatScaleTimelineFieldValueForDisplay({fieldSchema, value});

		case 'translate':
			return (
				formatTranslateTimelineFieldValueForDisplay({fieldSchema, value}) ??
				formatUnknownTimelineValueForDisplay(value)
			);

		case 'transform-origin':
			return (
				formatTransformOriginTimelineFieldValueForDisplay({
					fieldSchema,
					value,
				}) ?? formatUnknownTimelineValueForDisplay(value)
			);

		case 'uv-coordinate':
			return (
				formatUvCoordinateTimelineFieldValueForDisplay({fieldSchema, value}) ??
				formatUnknownTimelineValueForDisplay(value)
			);

		case 'text-content':
			return String(value);

		case 'array':
		case 'boolean':
		case 'color':
		case 'enum':
		case 'hidden':
			return formatUnknownTimelineValueForDisplay(value);

		default:
			return formatUnknownTimelineValueForDisplay(value);
	}
};
