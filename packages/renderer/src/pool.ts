export class Pool<T> {
  resources: T[];
  waiters: ((r: T) => void)[];

  constructor(resources: T[]) {
    this.resources = resources;
    this.waiters = [];
  }

  acquire(): Promise<T> {
    const resource = this.resources.pop();
    if (resource !== undefined) {
      return Promise.resolve(resource);
    } else {
      return new Promise((resolve) => {
        this.waiters.push((freeResource: T) => {
          resolve(freeResource);
        });
      });
    }
  }

  release(resource: T): void {
    const waiter = this.waiters.pop();
    if (waiter !== undefined) {
      waiter(resource);
    } else {
      this.resources.push(resource);
    }
  }
}
