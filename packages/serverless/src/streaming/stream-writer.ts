import type {ResponseStream} from './response-stream';

export type ResponseStreamWriter = {
	write: (message: Uint8Array) => Promise<void>;
	end: () => Promise<void>;
};

// Ensures that the previous write is finished before the next one is started
// Genius solution by ChatGPT
export const streamWriter = (
	responseStream: ResponseStream,
): ResponseStreamWriter => {
	let promiseChain = Promise.resolve();

	const write = (message: Uint8Array): Promise<void> => {
		promiseChain = promiseChain.then(() => {
			return new Promise<void>((resolve, reject) => {
				responseStream.write(message, (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		});

		return promiseChain;
	};

	const end = (): Promise<void> => {
		promiseChain = promiseChain.then(() => {
			return new Promise<void>((resolve) => {
				responseStream.end(() => {
					resolve();
				});
			});
		});

		return promiseChain;
	};

	return {write, end};
};
