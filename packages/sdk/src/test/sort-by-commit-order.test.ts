import {expect, test} from 'bun:test';
import {sortItemsByCommitOrder} from '../sort-by-commit-order';

test('prefers committed order and otherwise preserves internal order', () => {
	const internalOrder = [
		{id: 'second', order: 1},
		{id: 'first', order: 0},
		{id: 'not-committed-a', order: null},
		{id: 'not-committed-b', order: null},
	];

	expect(
		sortItemsByCommitOrder(internalOrder, (item) => item.order).map(
			(item) => item.id,
		),
	).toEqual(['first', 'second', 'not-committed-a', 'not-committed-b']);
	expect(
		sortItemsByCommitOrder(
			internalOrder.map((item) => ({...item, order: null})),
			(item) => item.order,
		).map((item) => item.id),
	).toEqual(internalOrder.map((item) => item.id));
});
