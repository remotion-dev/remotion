import {expect, test} from 'bun:test';
import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {SequenceNodePath, SequencePropsSubscriptionKey} from 'remotion';
import {migrateExpandedTracksForSubscriptionKey} from '../helpers/migrate-expanded-tracks-for-subscription-key';

const makeKey = (nodePath: SequenceNodePath): SequencePropsSubscriptionKey => ({
	absolutePath: '/project/src/Comp.tsx',
	nodePath,
	sequenceKeys: ['from', 'durationInFrames'],
	effectKeys: [],
});

const expandedKey = (
	subscriptionKey: SequencePropsSubscriptionKey,
	auxiliaryKeys: string[],
	index: number,
) =>
	[
		stringifySequenceExpandedRowKey(subscriptionKey),
		auxiliaryKeys.join('.'),
		index,
	].join('.');

test('migrates expanded keys when subscription node path changes', () => {
	const oldKey = makeKey(['body', 0, 'children', 1]);
	const newKey = makeKey(['body', 0, 'children', 2]);
	const unrelatedKey = makeKey(['body', 0, 'children', 3]);

	const prev = {
		[expandedKey(oldKey, [], 0)]: true,
		[expandedKey(oldKey, ['controls', 'from'], 0)]: true,
		[expandedKey(unrelatedKey, [], 0)]: true,
	};

	const next = migrateExpandedTracksForSubscriptionKey(prev, oldKey, newKey);

	expect(next).toEqual({
		[expandedKey(newKey, [], 0)]: true,
		[expandedKey(newKey, ['controls', 'from'], 0)]: true,
		[expandedKey(unrelatedKey, [], 0)]: true,
	});
});

test('returns null when subscription key is unchanged', () => {
	const key = makeKey(['body', 0]);
	const prev = {
		[expandedKey(key, [], 0)]: true,
	};

	expect(migrateExpandedTracksForSubscriptionKey(prev, key, key)).toBe(null);
});
