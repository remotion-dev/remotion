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
	if (locks.length === 0) {
		resolveWaiters();
	}
};

const resolveWaiters = () => {
	waiters.forEach((w) => w());
};

export const waitForSymbolicationToBeDone = () => {
	const success = new Promise<void>((resolve) => {
		waiters.push(() => {
			resolve();
		});
	});
	const timeout = new Promise<void>((resolve) => {
		setTimeout(() => resolve(), 5000);
	});

	return Promise.all([success, timeout]);
};
