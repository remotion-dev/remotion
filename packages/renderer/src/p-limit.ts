export const pLimit = (concurrency: number) => {
	const queue: Function[] = [];
	let activeCount = 0;

	const next = () => {
		activeCount--;

		if (queue.length > 0) {
			queue.shift()?.();
		}
	};

	const run = async <Arguments extends unknown[], ReturnType>(
		fn: (..._arguments: Arguments) => PromiseLike<ReturnType> | ReturnType,
		resolve: (res: Promise<ReturnType>) => void,
		...args: Arguments
	) => {
		activeCount++;

		// eslint-disable-next-line require-await
		const result = (async () => fn(...args))();

		resolve(result);

		try {
			await result;
		} catch {}

		next();
	};

	const enqueue = <Arguments extends unknown[], ReturnType>(
		fn: (..._arguments: Arguments) => PromiseLike<ReturnType> | ReturnType,
		resolve: (res: Promise<ReturnType>) => void,
		...args: Arguments
	) => {
		queue.push(() => run(fn, resolve, ...args));

		(async () => {
			// This function needs to wait until the next microtask before comparing
			// `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
			// when the run function is dequeued and called. The comparison in the if-statement
			// needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
			await Promise.resolve();

			if (activeCount < concurrency && queue.length > 0) {
				queue.shift()?.();
			}
		})();
	};

	const generator = <Arguments extends unknown[], ReturnType>(
		fn: (..._arguments: Arguments) => PromiseLike<ReturnType> | ReturnType,
		...args: Arguments
	) =>
		new Promise<ReturnType>((resolve) => {
			enqueue(fn, resolve, ...args);
		});

	Object.defineProperties(generator, {
		activeCount: {
			get: () => activeCount,
		},
		pendingCount: {
			get: () => queue.length,
		},
		clearQueue: {
			value: () => {
				queue.length = 0;
			},
		},
	});

	return generator;
};
