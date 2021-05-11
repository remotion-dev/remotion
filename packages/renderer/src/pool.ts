export class Pool<T> {
	resources: T[];
	waiters: ((r: T) => void)[];

	constructor(resources: T[]) {
		this.resources = resources;
		this.waiters = [];
	}

	acquire(): Promise<T> {
		const resource = this.resources.shift();
		if (resource !== undefined) {
			return Promise.resolve(resource);
		}

		return new Promise((resolve) => {
			this.waiters.push((freeResource: T) => {
				resolve(freeResource);
			});
		});
	}

	release(resource: T): void {
		const waiter = this.waiters.shift();
		if (waiter === undefined) {
			this.resources.push(resource);
		} else {
			waiter(resource);
		}
	}
}
