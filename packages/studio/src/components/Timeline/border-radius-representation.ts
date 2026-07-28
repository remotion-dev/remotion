import {
	BORDER_RADIUS_LONGHAND_KEYS,
	BORDER_RADIUS_SHORTHAND_KEY,
} from '@remotion/studio-shared';
import type {CanUpdateSequencePropStatus, DragOverrideValue} from 'remotion';

export {BORDER_RADIUS_LONGHAND_KEYS, BORDER_RADIUS_SHORTHAND_KEY};

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

export const getBorderRadiusConversion = (
	props: Record<string, CanUpdateSequencePropStatus> | undefined,
	dragOverrides: Record<string, DragOverrideValue> = {},
): BorderRadiusConversion | null => {
	const getStaticValue = (key: string) => {
		const status = props?.[key];
		if (status !== undefined && status.status !== 'static') {
			return {isStatic: false as const, value: undefined};
		}

		const dragOverride = dragOverrides[key];
		if (dragOverride?.type === 'keyframed') {
			return {isStatic: false as const, value: undefined};
		}

		return {
			isStatic: true as const,
			value:
				dragOverride?.type === 'static'
					? dragOverride.value
					: status?.codeValue,
		};
	};

	const shorthand = getStaticValue(BORDER_RADIUS_SHORTHAND_KEY);
	if (shorthand.isStatic && typeof shorthand.value === 'number') {
		return {type: 'individual', value: shorthand.value};
	}

	const longhands = BORDER_RADIUS_LONGHAND_KEYS.map(getStaticValue);
	const hasNoAuthoredRadius = [shorthand, ...longhands].every(
		(status) => status.isStatic && status.value === undefined,
	);
	if (hasNoAuthoredRadius) {
		return {type: 'individual', value: 0};
	}

	if (
		longhands.every(
			(status) => status.isStatic && typeof status.value === 'number',
		)
	) {
		const values = longhands.map((status) => status.value);
		if (values.every((value) => value === values[0])) {
			return {type: 'shorthand', value: values[0] as number};
		}
	}

	return null;
};
