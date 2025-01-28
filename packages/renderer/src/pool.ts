import type {Page} from './browser/BrowserPage';

export class Pool {
	resources: Page[];
	waiters: ((r: Page) => void)[];

	constructor(resources: Page[]) {
		this.resources = resources;
		this.waiters = [];
	}

	acquire(): Promise<Page> {
		const resource = this.resources.shift();
		if (resource !== undefined) {
			return Promise.resolve(resource);
		}

		return new Promise((resolve) => {
			this.waiters.push((freeResource: Page) => {
				resolve(freeResource);
			});
		});
	}

	release(resource: Page): void {
		const waiter = this.waiters.shift();
		if (waiter === undefined) {
			this.resources.push(resource);
		} else {
			waiter(resource);
		}
	}
}
