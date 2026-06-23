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
let runningEntry: {
	waiter: Waiter;
	cancel: () => void;
	settle: () => void;
} | null = null;

export const processNext = (): void => {
	if (running >= CONCURRENCY) {
		if (runningEntry?.waiter.getPriority() === null) {
			// Running entry went stale: free its slot so a fresh waiter can run
			// instead of deadlocking behind work nobody needs anymore.
			runningEntry.cancel();
		} else {
			return;
		}
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

	let settled = false;
	let cancelled = false;
	const entry = {
		waiter: next,
		cancel: () => {
			cancelled = true;
			entry.settle();
		},
		settle: () => {
			if (settled) {
				return;
			}

			settled = true;
			running--;
			if (runningEntry === entry) {
				runningEntry = null;
			}
		},
	};
	runningEntry = entry;

	next.fn().then(
		(value) => {
			entry.settle();
			if (cancelled) {
				return;
			}

			next.onDone(value, processNext);
		},
		(err) => {
			entry.settle();
			if (cancelled) {
				return;
			}

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
