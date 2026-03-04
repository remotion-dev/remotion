import {expect, test} from 'bun:test';
import type {TSequence} from 'remotion';
import {
	compareNonceHistories,
	sortItemsByNonceHistory,
} from '../helpers/sort-by-nonce-history';

type NonceHistory = TSequence['nonce'];

test('sorts by latest nonce ascending', () => {
	const a: NonceHistory = [[0, 10]];
	const b: NonceHistory = [[0, 5]];
	const c: NonceHistory = [[0, 8]];

	const items = [
		{id: 'a', nonce: a},
		{id: 'b', nonce: b},
		{id: 'c', nonce: c},
	];

	const sorted = sortItemsByNonceHistory(items);
	expect(sorted.map((i) => i.id)).toEqual(['b', 'c', 'a']);
});

test('uses shared epoch for comparison', () => {
	const a: NonceHistory = [
		[0, 10],
		[1, 3],
	];
	const b: NonceHistory = [
		[0, 5],
		[1, 7],
	];

	// Both share epoch 1 (most recent shared). a=3 < b=7
	expect(compareNonceHistories(a, b)).toBeLessThan(0);
});

test('items with different epoch counts sort by latest nonce', () => {
	const a: NonceHistory = [[2, 585]];
	const b: NonceHistory = [
		[0, 526],
		[1, 559],
		[2, 586],
	];
	const c: NonceHistory = [
		[0, 527],
		[1, 560],
		[2, 587],
	];

	const items = [
		{id: 'a', nonce: a},
		{id: 'b', nonce: b},
		{id: 'c', nonce: c},
	];

	const sorted = sortItemsByNonceHistory(items);
	expect(sorted.map((i) => i.id)).toEqual(['a', 'b', 'c']);
});

test('sorts by nonce in the most recent shared epoch across different history lengths', () => {
	const a: NonceHistory = [
		[1, 540],
		[2, 558],
		[3, 576],
	];
	const b: NonceHistory = [[3, 583]];
	const c: NonceHistory = [
		[3, 577],
		[4, 594],
		[5, 603],
		[6, 618],
	];

	const items = [
		{id: 'b', nonce: b},
		{id: 'c', nonce: c},
		{id: 'a', nonce: a},
	];

	// a and b share epoch 3: 576 vs 583 → a first
	// a and c share epoch 3: 576 vs 577 → a first
	// b and c share epoch 3: 583 vs 577 → c first
	// Order: a (576), c (577), b (583)
	const sorted = sortItemsByNonceHistory(items);
	expect(sorted.map((i) => i.id)).toEqual(['a', 'c', 'b']);
});

test('items from higher epochs come before items from lower epochs when no shared epoch', () => {
	const item1: NonceHistory = [
		[3, 548],
		[4, 556],
	];
	const item2: NonceHistory = [[4, 557]];
	const item3: NonceHistory = [[5, 564]];
	const item4: NonceHistory = [[5, 565]];
	const item5: NonceHistory = [
		[4, 555],
		[5, 566],
	];

	const items = [
		{id: '1', nonce: item1},
		{id: '2', nonce: item2},
		{id: '3', nonce: item3},
		{id: '4', nonce: item4},
		{id: '5', nonce: item5},
	];

	// 3, 4, 5 share epoch 5: 564 < 565 < 566 → 3, 4, 5
	// 1, 2, 5 share epoch 4: 555 < 556 < 557 → 5, 1, 2
	// 3 vs 1: no shared epoch, epoch 5 > epoch 4 → 3 first
	// Combined: 3, 4, 5, 1, 2
	const sorted = sortItemsByNonceHistory(items);
	expect(sorted.map((i) => i.id)).toEqual(['3', '4', '5', '1', '2']);
});

test('all items sharing an epoch sort by nonce in that epoch regardless of later epochs', () => {
	const item1: NonceHistory = [
		[0, 520],
		[1, 534],
		[2, 540],
	];
	const item2: NonceHistory = [[2, 544]];
	const item3: NonceHistory = [[2, 545]];
	const item4: NonceHistory = [
		[2, 541],
		[3, 552],
	];
	const item5: NonceHistory = [
		[2, 542],
		[3, 553],
	];

	const items = [
		{id: '1', nonce: item1},
		{id: '2', nonce: item2},
		{id: '3', nonce: item3},
		{id: '4', nonce: item4},
		{id: '5', nonce: item5},
	];

	// All share epoch 2: 540, 541, 542, 544, 545
	const sorted = sortItemsByNonceHistory(items);
	expect(sorted.map((i) => i.id)).toEqual(['1', '4', '5', '2', '3']);
});

test('item with later epoch should sort by shared epoch 0 nonce', () => {
	const item1: NonceHistory = [[0, 520]];
	const item2: NonceHistory = [[0, 523]];
	const item3: NonceHistory = [
		[0, 521],
		[1, 530],
	];

	const items = [
		{id: '1', nonce: item1},
		{id: '2', nonce: item2},
		{id: '3', nonce: item3},
	];

	// All share epoch 0: 520, 521, 523 → 1, 3, 2
	const sorted = sortItemsByNonceHistory(items);
	expect(sorted.map((i) => i.id)).toEqual(['1', '3', '2']);
});

test('unconnected items with higher epoch sort last', () => {
	const item1: NonceHistory = [
		[0, 520],
		[1, 528],
		[2, 536],
		[3, 542],
	];
	const item2: NonceHistory = [[3, 545]];
	const item3: NonceHistory = [
		[0, 521],
		[1, 529],
	];
	const item4: NonceHistory = [
		[0, 522],
		[1, 530],
	];

	const items = [
		{id: '1', nonce: item1},
		{id: '2', nonce: item2},
		{id: '3', nonce: item3},
		{id: '4', nonce: item4},
	];

	// 1 < 2 (epoch 3: 542 < 545)
	// 1 < 3 (epoch 1: 528 < 529)
	// 1 < 4 (epoch 1: 528 < 530)
	// 3 < 4 (epoch 1: 529 < 530)
	// 2 vs 3/4: no shared epoch, no transitive path → lower epoch first (3/4 epoch 1 < 2 epoch 3)
	const sorted = sortItemsByNonceHistory(items);
	expect(sorted.map((i) => i.id)).toEqual(['1', '3', '4', '2']);
});
