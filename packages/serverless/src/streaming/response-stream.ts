import {Writable} from 'stream';

type Chunk = {
	PayloadChunk: {Payload: string | Buffer | null};
	InvokeComplete: boolean;
};

export class ResponseStream extends Writable {
	private queue: Chunk[] = [];
	private waitingResolve: ((value?: Chunk) => void)[] = [];
	private response: Uint8Array[];

	constructor() {
		super();
		this.response = [];
	}

	_write(
		chunk: any,
		encoding: BufferEncoding,
		callback: (error?: Error | null) => void,
	): void {
		const data = Buffer.from(chunk, encoding);
		const resolve = this.waitingResolve.shift();
		if (resolve) {
			resolve({PayloadChunk: {Payload: data}, InvokeComplete: false});
		} else {
			this.queue.push({PayloadChunk: {Payload: data}, InvokeComplete: false});
		}

		this.response.push(Buffer.from(chunk, encoding));

		callback();
	}

	_finish() {
		const resolve = this.waitingResolve.shift();
		if (resolve) {
			resolve({PayloadChunk: {Payload: null}, InvokeComplete: true});
		} else {
			this.queue.push({PayloadChunk: {Payload: null}, InvokeComplete: true});
		}
	}

	getBufferedData(): Buffer {
		return Buffer.concat(this.response as Uint8Array[]);
	}

	async *[Symbol.asyncIterator](): AsyncGenerator<Chunk, void, void> {
		while (true) {
			if (this.queue.length > 0) {
				const shifted = this.queue.shift()!;
				yield shifted;
				if (shifted.InvokeComplete) {
					break;
				}
			} else {
				// Wait for new data to be written
				const shifted = await new Promise<Chunk>((resolve) => {
					this.waitingResolve.push((data) => {
						Promise.resolve(data).then((d) => {
							if (d) {
								resolve(d);
							}
						});
					});
				});
				yield shifted;
				if (shifted.InvokeComplete) {
					break;
				}
			}
		}
	}
}
