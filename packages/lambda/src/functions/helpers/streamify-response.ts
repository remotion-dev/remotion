import {Writable} from 'stream';

type Chunk = {
	PayloadChunk: {Payload: string | Buffer | null};
	InvokeComplete: boolean;
};

export class ResponseStream extends Writable {
	private queue: Chunk[] = [];
	private waitingResolve: ((value?: Chunk) => void)[] = [];
	private response: Buffer[];

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
		return Buffer.concat(this.response);
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

export function streamifyResponse(handler: Function): Function {
	// Check if we are inside Lambda
	if (
		process.env.AWS_LAMBDA_FUNCTION_VERSION &&
		process.env.AWS_LAMBDA_FUNCTION_NAME &&
		// @ts-expect-error
		typeof awslambda !== 'undefined'
	) {
		// @ts-expect-error
		return awslambda.streamifyResponse(handler);
	}

	return () => {
		throw new Error('Lambda not detected');
	};
}
