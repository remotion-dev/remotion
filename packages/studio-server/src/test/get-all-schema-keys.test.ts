import {expect, test} from 'bun:test';
import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {getAllSchemaKeys} from '../codemods/get-all-schema-keys';

const {getFlatSchemaWithAllKeys} = Internals;

test('getAllSchemaKeys returns every key across all enum variants', () => {
	const keys = getAllSchemaKeys(Internals.sequenceSchema);
	expect(keys.sort()).toEqual(
		[
			'layout',
			'style.translate',
			'style.scale',
			'style.rotate',
			'style.opacity',
		].sort(),
	);
});

test('getFlatSchema throws when discriminated union variants share a key', () => {
	const conflictingSchema: SequenceSchema = {
		mode: {
			type: 'enum',
			default: 'a',
			description: 'Mode',
			variants: {
				a: {
					shared: {
						type: 'number',
						default: 1,
					},
				},
				b: {
					shared: {
						type: 'number',
						default: 2,
					},
				},
			},
		},
	};

	expect(() => getFlatSchemaWithAllKeys(conflictingSchema)).toThrow(
		'Duplicate key "shared"',
	);
});
