let locks: number[] = [];
type Waiter = () => void;

const waiters: Waiter[] = [];

export const registerErrorSymbolicationLock = () => {
	const id = Math.random();
	locks.push(id);
	return id;
};

export const unlockErrorSymbolicationLock = (id: number) => {
	locks = locks.filter((l) => l !== id);
	resolveWaiters();
};

const resolveWaiters = () => {
	if (locks.length === 0) {
		waiters.forEach((w) => w());
	}
};

export const waitForSymbolicationToBeDone = (): Promise<unknown> => {
	const success = new Promise<void>((resolve) => {
		waiters.push(() => {
			resolve();
		});
	});
	const timeout = new Promise<void>((resolve) => {
		setTimeout(() => resolve(), 5000);
	});

	resolveWaiters();

	return Promise.all([success, timeout]);
};
