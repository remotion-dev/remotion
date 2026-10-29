import {expect, test} from 'bun:test';
import {
	findDanglingConnectors,
	type TransitionSeriesChildKind,
} from '../find-dangling-connectors.js';

const S: TransitionSeriesChildKind = 'sequence';
const C: TransitionSeriesChildKind = 'connector';

const run = (kinds: TransitionSeriesChildKind[], deletedIndices: number[]) =>
	findDanglingConnectors({
		kinds,
		deleted: kinds.map((_, i) => deletedIndices.includes(i)),
	}).sort((a, b) => a - b);

test('a deleted sequence takes the following connector', () => {
	expect(run([S, C, S, C, S], [2])).toEqual([3]);
});

test('the first sequence takes the connector after it', () => {
	expect(run([S, C, S, C, S], [0])).toEqual([1]);
});

test('the last sequence takes the connector before it', () => {
	expect(run([S, C, S, C, S], [4])).toEqual([3]);
});

test('a connector that is deleted too is not taken twice', () => {
	expect(run([S, C, S, C, S], [2, 3])).toEqual([]);
	expect(run([S, C, S, C, S], [1, 2])).toEqual([]);
});

test('deleting the last two sequences removes both connectors', () => {
	expect(run([S, C, S, C, S], [2, 4])).toEqual([1, 3]);
});

test('a connector between two remaining sequences stays', () => {
	expect(run([S, C, S, S], [2])).toEqual([]);
});

test('entrance and exit transitions go with their only sequence', () => {
	expect(run([C, S, C], [1])).toEqual([0, 2]);
});

test('entrance and exit transitions stay while a sequence remains', () => {
	// Deleting the last sequence: the exit transition now follows the first.
	expect(run([C, S, C, S, C], [3])).toEqual([2]);
	// Deleting the first sequence: the entrance transition now leads into
	// the second.
	expect(run([C, S, C, S, C], [1])).toEqual([2]);
});

test('connectors away from the deletion are left alone', () => {
	expect(run([S, C, C, S, C, S], [5])).toEqual([4]);
});
