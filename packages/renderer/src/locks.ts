type Waiter = () => void;

export const createLock = ({timeout}: {timeout: number | null}) => {
	let locks: number[] = [];

	const waiters: Waiter[] = [];

	const lock = () => {
		const id = Math.random();
		locks.push(id);
		return id;
	};

	const unlock = (id: number) => {
		locks = locks.filter((l) => l !== id);
		resolveWaiters();
	};

	const resolveWaiters = () => {
		if (locks.length === 0) {
			waiters.forEach((w) => w());
		}
	};

	const waitForAllToBeDone = (): Promise<unknown> => {
		const success = new Promise<void>((resolve) => {
			waiters.push(() => {
				resolve();
			});
		});

		resolveWaiters();

		if (locks.length === 0) {
			return Promise.resolve();
		}

		if (timeout === null) {
			return success;
		}

		const timeoutFn = new Promise<void>((resolve) => {
			setTimeout(() => {
				return resolve();
			}, timeout);
		});

		return Promise.race([success, timeoutFn]);
	};

	return {
		lock,
		unlock,
		waitForAllToBeDone,
	};
};
