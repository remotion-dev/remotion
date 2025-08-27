type WithResolvers = ReturnType<typeof Promise.withResolvers>;
type WithResolversVoid = ReturnType<typeof Promise.withResolvers<void>>;

type IteratorResolver = {
	frame: number;
	withPromise: WithResolvers;
};

export const makeIterator = () => {
	console.log('created iterator');
	const queue: IteratorResolver[] = [];
	let notify: WithResolversVoid | null = null;
	let cancelled = false;

	const iterator = async function* () {
		// eslint-disable-next-line no-unmodified-loop-condition
		while (!cancelled) {
			// Drain queue if there is something
			const first = queue[0];
			console.log('first', first);
			if (first) {
				yield first.frame;
				console.log('yielded', first.frame);
				first.withPromise.resolve();
				queue.shift();
				continue;
			}

			// Nothing in queue: await a notification
			if (!notify) {
				notify = Promise.withResolvers<void>();
				console.log('waiting for notification');
			}

			try {
				await notify.promise;
			} finally {
				// Reset notify so a future empty state can await again
				notify = null;
			}

			console.log('notified');
		}
	};

	return {
		iterator,
		requestFrame: (frame: number) => {
			const promise = Promise.withResolvers<unknown>();
			queue.push({frame, withPromise: promise});
			// Wake up the iterator if it's waiting
			notify?.resolve();
			return promise.promise;
		},
		cancel: () => {
			cancelled = true;
			for (const resolver of queue) {
				resolver.withPromise.reject(new Error('Cancelled'));
			}

			queue.length = 0;
			// Also wake any waiter so the loop can observe empty/cancel state if you add one
			notify?.resolve();
		},
	};
};

export type FrameIterator = ReturnType<typeof makeIterator>;
