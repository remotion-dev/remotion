import {expect, test} from 'bun:test';
import type {SequenceSchema} from 'remotion';
import {isSchemaFieldKeyframable} from '../keyframe-interpolation-function';

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
	} satisfies SequenceSchema;

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
	} satisfies SequenceSchema;

	expect(isSchemaFieldKeyframable({schema, key: 'playbackRate'})).toBe(false);
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
	} satisfies SequenceSchema;

	expect(isSchemaFieldKeyframable({schema, key: 'style.opacity'})).toBe(true);
});
