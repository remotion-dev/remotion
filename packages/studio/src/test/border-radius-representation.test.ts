import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropStatus} from 'remotion';
import {
	BORDER_RADIUS_LONGHAND_KEYS,
	getBorderRadiusConversion,
} from '../components/Timeline/border-radius-representation';

test('a static shorthand can be converted to individual corners', () => {
	expect(
		getBorderRadiusConversion({
			'style.borderRadius': {status: 'static', codeValue: 12},
		}),
	).toEqual({type: 'individual', value: 12});
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
