import {expect, test} from 'bun:test';
import {Internals} from 'remotion';
import {findPropsToDelete} from '../find-props-to-delete';

test('find right values to delete when upgrading a discriminated union', () => {
	expect(
		findPropsToDelete({
			schema: Internals.sequenceSchema,
			key: 'unknown',
			value: 'none',
		}),
	).toEqual([]);
	expect(() =>
		findPropsToDelete({
			schema: Internals.sequenceSchema,
			key: 'layout',
			value: 123,
		}),
	).toThrow('Value must be a string, but is 123');
	expect(() =>
		findPropsToDelete({
			schema: Internals.sequenceSchema,
			key: 'layout',
			value: 'unknown',
		}),
	).toThrow(
		'Value for "layout" must be one of "absolute-fill", "none", got "unknown"',
	);

	expect(
		findPropsToDelete({
			schema: Internals.sequenceSchema,
			key: 'layout',
			value: 'none',
		}),
	).toEqual([
		'style.translate',
		'style.scale',
		'style.rotate',
		'style.opacity',
		'premountFor',
		'postmountFor',
		'styleWhilePremounted',
		'styleWhilePostmounted',
	]);

	expect(
		findPropsToDelete({
			schema: Internals.sequenceSchema,
			key: 'layout',
			value: 'absolute-fill',
		}),
	).toEqual([]);
});
