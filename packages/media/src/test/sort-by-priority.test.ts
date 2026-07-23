import {expect, test} from 'vitest';
import {waitForTurn} from '../audio/sort-by-priority';

test('does not resolve a running waiter after it got cancelled for being stale', async () => {
	const events: string[] = [];
	let firstPriority: number | null = 0;
	const first = {
		resolve: null as ((value: string) => void) | null,
	};

	waitForTurn({
		getPriority: () => firstPriority,
		fn: () =>
			new Promise<string>((resolve) => {
				first.resolve = resolve;
			}),
		onDone: () => {
			events.push('first done');
		},
		onError: () => {
			events.push('first error');
		},
	});

	firstPriority = null;

	waitForTurn({
		getPriority: () => 0,
		fn: () => Promise.resolve('second'),
		onDone: () => {
			events.push('second done');
		},
		onError: () => {
			events.push('second error');
		},
	});

	await Promise.resolve();
	expect(events).toEqual(['second done']);

	if (!first.resolve) {
		throw new Error('First waiter did not start');
	}

	first.resolve('first');
	await Promise.resolve();

	expect(events).toEqual(['second done']);
});
