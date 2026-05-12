type Waiter = {
	getPriority: () => number | null;
	fn: () => Promise<unknown>;
	onDone: (result: unknown, triggerNext: () => void) => void;
	onError: (err: unknown) => void;
};

export class StaleWaiterError extends Error {
	constructor() {
		super('Waiter became stale before it got its turn');
		this.name = 'StaleWaiterError';
	}
}

const CONCURRENCY = 1;

const waiters: Waiter[] = [];
let running = 0;

export const processNext = (): void => {
	if (running >= CONCURRENCY) {
		return;
	}

	// Collect stale waiters first, remove them from the queue,
	// and only then fire their onError callbacks. onError may synchronously
	// re-enter processNext, which would otherwise shrink `waiters` from under
	// the iteration and leave `waiters[i]` undefined on the next `i--`.
	const staleWaiters: Waiter[] = [];
	for (let i = waiters.length - 1; i >= 0; i--) {
		if (waiters[i].getPriority() === null) {
			const [stale] = waiters.splice(i, 1);
			staleWaiters.push(stale);
		}
	}

	for (const stale of staleWaiters) {
		stale.onError(new StaleWaiterError());
	}

	if (waiters.length === 0) {
		return;
	}

	let bestIndex = 0;
	let bestPriority = waiters[0].getPriority();
	if (bestPriority === null) {
		throw new Error('Stale waiter should have been removed');
	}

	for (let i = 1; i < waiters.length; i++) {
		const priority = waiters[i].getPriority();
		if (priority === null) {
			throw new Error('Stale waiter should have been removed');
		}

		if (priority < bestPriority) {
			bestPriority = priority;
			bestIndex = i;
		}
	}

	if (bestPriority > 2) {
		// more than 2 seconds time, let's not do it yet!
		return;
	}

	const [next] = waiters.splice(bestIndex, 1);
	running++;

	next.fn().then(
		(value) => {
			running--;
			next.onDone(value, processNext);
		},
		(err) => {
			running--;
			next.onError(err);
		},
	);
};

export const waitForTurn = <T>({
	getPriority,
	fn,
	onDone,
	onError,
}: {
	getPriority: () => number | null;
	fn: () => Promise<T>;
	onDone: (result: T, triggerNext: () => void) => void;
	onError: (err: unknown) => void;
}): void => {
	waiters.push({
		getPriority,
		fn,
		onDone: onDone as (result: unknown, triggerNext: () => void) => void,
		onError: onError as (err: unknown) => void,
	});
	processNext();
};
