import {expect, test} from 'bun:test';
import {optimisticUpdateForPropStatuses} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropsResponse,
	CanUpdateSequencePropStatus,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	BORDER_RADIUS_LONGHAND_KEYS,
	BORDER_RADIUS_SHORTHAND_KEY,
	getBorderRadiusConversion,
	getBorderRadiusConversionChanges,
	getBorderRadiusResetFieldKeys,
} from '../components/Timeline/border-radius-representation';

test('a static shorthand can be converted to individual corners', () => {
	const conversion = getBorderRadiusConversion({
		'style.borderRadius': {status: 'static', codeValue: 12},
	});
	expect(conversion).toEqual({type: 'individual', value: 12});
	if (conversion === null) {
		throw new Error('Expected a border radius conversion');
	}

	const changes = getBorderRadiusConversionChanges(conversion);
	expect(changes).toEqual([
		{fieldKey: BORDER_RADIUS_SHORTHAND_KEY, value: undefined},
		...BORDER_RADIUS_LONGHAND_KEYS.map((fieldKey) => ({
			fieldKey,
			value: 12,
		})),
	]);

	const initial: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			[BORDER_RADIUS_SHORTHAND_KEY]: {status: 'static', codeValue: 12},
			...Object.fromEntries(
				BORDER_RADIUS_LONGHAND_KEYS.map((key) => [
					key,
					{status: 'static', codeValue: 12},
				]),
			),
		},
		effects: [],
	};
	const optimistic = changes.reduce<CanUpdateSequencePropsResponse>(
		(previous, change) =>
			optimisticUpdateForPropStatuses({
				previous,
				fieldKey: change.fieldKey,
				value: change.value,
				defaultValue: null,
				schema: NoReactInternals.sequenceSchema,
			}),
		initial,
	);
	expect(optimistic.canUpdate).toBe(true);
	if (optimistic.canUpdate) {
		expect(optimistic.props[BORDER_RADIUS_SHORTHAND_KEY]).toEqual({
			status: 'static',
			codeValue: undefined,
		});
	}
});

test('an unauthored border radius can be converted to zero-valued corners', () => {
	for (const props of [
		undefined,
		{},
		{
			[BORDER_RADIUS_SHORTHAND_KEY]: {
				status: 'static' as const,
				codeValue: undefined,
			},
			...Object.fromEntries(
				BORDER_RADIUS_LONGHAND_KEYS.map((key) => [
					key,
					{status: 'static' as const, codeValue: undefined},
				]),
			),
		},
	]) {
		const conversion = getBorderRadiusConversion(props);
		expect(conversion).toEqual({type: 'individual', value: 0});
		if (conversion === null) {
			throw new Error('Expected an unauthored border radius conversion');
		}

		expect(getBorderRadiusConversionChanges(conversion)).toEqual([
			{fieldKey: BORDER_RADIUS_SHORTHAND_KEY, value: undefined},
			...BORDER_RADIUS_LONGHAND_KEYS.map((fieldKey) => ({
				fieldKey,
				value: 0,
			})),
		]);
	}
});

test('four equal static longhands can be converted to a shorthand', () => {
	expect(
		getBorderRadiusConversion(
			Object.fromEntries(
				BORDER_RADIUS_LONGHAND_KEYS.map((key) => [
					key,
					{status: 'static', codeValue: 8},
				]),
			) as Record<string, CanUpdateSequencePropStatus>,
		),
	).toEqual({type: 'shorthand', value: 8});
});

test('resetting the shorthand also clears its expanded longhand statuses', () => {
	expect(
		getBorderRadiusResetFieldKeys({
			fieldKey: BORDER_RADIUS_SHORTHAND_KEY,
			schema: NoReactInternals.sequenceSchema,
		}),
	).toEqual([BORDER_RADIUS_SHORTHAND_KEY, ...BORDER_RADIUS_LONGHAND_KEYS]);
	expect(
		getBorderRadiusResetFieldKeys({
			fieldKey: BORDER_RADIUS_SHORTHAND_KEY,
			schema: {
				[BORDER_RADIUS_SHORTHAND_KEY]: {
					type: 'number',
					default: 0,
					hiddenFromList: false,
				},
			},
		}),
	).toEqual([BORDER_RADIUS_SHORTHAND_KEY]);
});

test('unequal, keyframed, and computed radii cannot be converted', () => {
	expect(
		getBorderRadiusConversion({
			'style.borderTopLeftRadius': {status: 'static', codeValue: 1},
			'style.borderTopRightRadius': {status: 'static', codeValue: 2},
			'style.borderBottomRightRadius': {status: 'static', codeValue: 1},
			'style.borderBottomLeftRadius': {status: 'static', codeValue: 2},
		}),
	).toBe(null);
	expect(
		getBorderRadiusConversion({
			'style.borderRadius': {status: 'computed'},
		}),
	).toBe(null);
	expect(
		getBorderRadiusConversion({
			'style.borderRadius': {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [{frame: 0, value: 0}],
				easing: [],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
				output: undefined,
			},
		}),
	).toBe(null);
});
