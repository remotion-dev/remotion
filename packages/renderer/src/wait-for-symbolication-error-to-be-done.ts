// Wait-until-zero barrier for pending error symbolications.
// States: idle (pending is empty) | pending (one or more ids registered).
// register: idle|pending -> pending. unlock(id): removes id; unknown ids are a
// no-op. When pending drains to empty, all current waiters resolve and are
// cleared. A waiter also resolves (and is removed) after a 50s timeout.

const pending = new Set<number>();
let waiters: Array<() => void> = [];
let nextId = 1;

export const registerErrorSymbolicationLock = (): number => {
	const id = nextId++;
	pending.add(id);
	return id;
};

export const unlockErrorSymbolicationLock = (id: number) => {
	pending.delete(id);
	if (pending.size === 0) {
		const toResolve = waiters;
		waiters = [];
		toResolve.forEach((w) => w());
	}
};

export const waitForSymbolicationToBeDone = (): Promise<void> => {
	if (pending.size === 0) {
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		const done = () => {
			clearTimeout(timer);
			resolve();
		};

		const timer = setTimeout(() => {
			waiters = waiters.filter((w) => w !== done);
			resolve();
		}, 50000);
		waiters.push(done);
	});
};
