import {expect, test} from 'bun:test';
import {Internals} from '../internals';
import {NoReactInternals} from '../no-react';

test('find right values to delete when upgrading a discriminated union', () => {
	expect(() =>
		Internals.findPropsToDelete({
			schema: NoReactInternals.sequenceSchema,
			key: 'unknown',
			value: 'none',
		}),
	).toThrow('Key "unknown" not found in schema');
	expect(() =>
		Internals.findPropsToDelete({
			schema: NoReactInternals.sequenceSchema,
			key: 'layout',
			value: 123,
		}),
	).toThrow('Value must be a string, but is 123');
	expect(() =>
		Internals.findPropsToDelete({
			schema: NoReactInternals.sequenceSchema,
			key: 'layout',
			value: 'unknown',
		}),
	).toThrow(
		'Value for "layout" must be one of "absolute-fill", "none", got "unknown"',
	);

	expect(
		Internals.findPropsToDelete({
			schema: NoReactInternals.sequenceSchema,
			key: 'layout',
			value: 'none',
		}),
	).toEqual([
		'style.transformOrigin',
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
		Internals.findPropsToDelete({
			schema: NoReactInternals.sequenceSchema,
			key: 'layout',
			value: 'absolute-fill',
		}),
	).toEqual([]);
});
