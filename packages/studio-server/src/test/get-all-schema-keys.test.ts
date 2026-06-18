import {expect, test} from 'bun:test';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

const {getFlatSchemaWithAllKeys} = Internals;

test('getAllSchemaKeys returns every key across all enum variants', () => {
	const keys = getAllSchemaKeys(NoReactInternals.sequenceSchema);
	expect(keys.sort()).toEqual(
		[
			'hidden',
			'name',
			'showInTimeline',
			'layout',
			'style.translate',
			'style.scale',
			'style.rotate',
			'style.transformOrigin',
			'style.opacity',
			'premountFor',
			'postmountFor',
			'styleWhilePremounted',
			'styleWhilePostmounted',
			'durationInFrames',
			'from',
			'freeze',
		].sort(),
	);
});

test('getFlatSchema throws when discriminated union variants share a key', () => {
	const conflictingSchema: InteractivitySchema = {
		mode: {
			type: 'enum',
			default: 'a',
			description: 'Mode',
			variants: {
				a: {
					shared: {
						type: 'number',
						default: 1,
						hiddenFromList: false,
					},
				},
				b: {
					shared: {
						type: 'number',
						default: 2,
						hiddenFromList: false,
					},
				},
			},
		},
	};

	expect(() => getFlatSchemaWithAllKeys(conflictingSchema)).toThrow(
		'Duplicate key "shared"',
	);
});
