import {expect, test} from 'bun:test';
import type {InteractivitySchema} from 'remotion';
import {Interactive} from 'remotion';
import {
	getKeyframeInterpolationFunctionForSchemaField,
	isSchemaFieldKeyframable,
} from '../keyframe-interpolation-function';

test('border longhand fields keyframe width and color, but not style', () => {
	const schema = Interactive.borderSchema;

	expect(isSchemaFieldKeyframable({schema, key: 'style.borderWidth'})).toBe(
		true,
	);
	expect(isSchemaFieldKeyframable({schema, key: 'style.borderColor'})).toBe(
		true,
	);
	expect(isSchemaFieldKeyframable({schema, key: 'style.borderStyle'})).toBe(
		false,
	);
});

test('isSchemaFieldKeyframable rejects enum fields', () => {
	const schema = {
		layout: {
			type: 'enum',
			default: 'absolute-fill',
			keyframable: true,
			variants: {
				'absolute-fill': {},
				none: {},
			},
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'layout'})).toBe(false);
});

test('isSchemaFieldKeyframable rejects explicitly disabled fields', () => {
	const schema = {
		playbackRate: {
			type: 'number',
			default: 1,
			hiddenFromList: false,
			keyframable: false,
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'playbackRate'})).toBe(false);
});

test('isSchemaFieldKeyframable rejects boolean fields', () => {
	const schema = {
		loop: {
			type: 'boolean',
			default: false,
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'loop'})).toBe(false);
});

test('isSchemaFieldKeyframable rejects font-family fields', () => {
	const schema = {
		'style.fontFamily': {
			type: 'font-family',
			default: undefined,
			keyframable: false,
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'style.fontFamily'})).toBe(
		false,
	);
});

test('isSchemaFieldKeyframable rejects boolean fields in enum variants', () => {
	const schema = {
		layout: {
			type: 'enum',
			default: 'absolute-fill',
			variants: {
				'absolute-fill': {
					horizontal: {
						type: 'boolean',
						default: true,
					},
				},
				none: {},
			},
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'horizontal'})).toBe(false);
});

test('isSchemaFieldKeyframable finds keyframable fields in enum variants', () => {
	const schema = {
		layout: {
			type: 'enum',
			default: 'absolute-fill',
			variants: {
				'absolute-fill': {
					'style.opacity': {
						type: 'number',
						default: 1,
						hiddenFromList: false,
					},
				},
				none: {},
			},
		},
	} satisfies InteractivitySchema;

	expect(isSchemaFieldKeyframable({schema, key: 'style.opacity'})).toBe(true);
});

test('transform-origin fields use interpolate keyframes', () => {
	const schema = {
		'style.transformOrigin': {
			type: 'transform-origin',
			default: '50% 50%',
		},
	} satisfies InteractivitySchema;

	expect(
		getKeyframeInterpolationFunctionForSchemaField({
			schema,
			key: 'style.transformOrigin',
		}),
	).toBe('interpolate');
});
