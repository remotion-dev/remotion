import type {CanUpdateSequencePropStatus, InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';

export const BORDER_RADIUS_SHORTHAND_KEY = 'style.borderRadius';
export const BORDER_RADIUS_LONGHAND_KEYS = [
	'style.borderTopLeftRadius',
	'style.borderTopRightRadius',
	'style.borderBottomRightRadius',
	'style.borderBottomLeftRadius',
] as const;

export type BorderRadiusConversion =
	| {readonly type: 'individual'; readonly value: number}
	| {readonly type: 'shorthand'; readonly value: number};

export type BorderRadiusConversionChange = {
	readonly fieldKey: string;
	readonly value: number | undefined;
};

export const getBorderRadiusConversionChanges = (
	conversion: BorderRadiusConversion,
): BorderRadiusConversionChange[] => {
	if (conversion.type === 'individual') {
		return [
			{fieldKey: BORDER_RADIUS_SHORTHAND_KEY, value: undefined},
			...BORDER_RADIUS_LONGHAND_KEYS.map((fieldKey) => ({
				fieldKey,
				value: conversion.value,
			})),
		];
	}

	return [
		...BORDER_RADIUS_LONGHAND_KEYS.map((fieldKey) => ({
			fieldKey,
			value: undefined,
		})),
		{fieldKey: BORDER_RADIUS_SHORTHAND_KEY, value: conversion.value},
	];
};

export const getBorderRadiusResetFieldKeys = ({
	fieldKey,
	schema,
}: {
	readonly fieldKey: string;
	readonly schema: InteractivitySchema;
}): string[] => {
	if (fieldKey !== BORDER_RADIUS_SHORTHAND_KEY) {
		return [fieldKey];
	}

	const flatSchema = Internals.getFlatSchemaWithAllKeys(schema);
	return [BORDER_RADIUS_SHORTHAND_KEY, ...BORDER_RADIUS_LONGHAND_KEYS].filter(
		(key) => key in flatSchema,
	);
};

export const getBorderRadiusConversion = (
	props: Record<string, CanUpdateSequencePropStatus> | undefined,
): BorderRadiusConversion | null => {
	const shorthand = props?.[BORDER_RADIUS_SHORTHAND_KEY];
	if (
		shorthand?.status === 'static' &&
		typeof shorthand.codeValue === 'number'
	) {
		return {type: 'individual', value: shorthand.codeValue};
	}

	const longhands = BORDER_RADIUS_LONGHAND_KEYS.map((key) => props?.[key]);
	if (
		longhands.every(
			(status) =>
				status?.status === 'static' && typeof status.codeValue === 'number',
		)
	) {
		const values = longhands.map((status) =>
			status?.status === 'static' ? status.codeValue : undefined,
		);
		if (values.every((value) => value === values[0])) {
			return {type: 'shorthand', value: values[0] as number};
		}
	}

	return null;
};
