import type {ResponseStream} from '../helpers/streamify-response';

export type ResponseStreamWriter = {
	write: (message: Buffer) => Promise<void>;
};

// Ensures that the previous write is finished before the next one is started
// Genius solution by ChatGPT
export const streamWriter = (
	responseStream: ResponseStream,
): ResponseStreamWriter => {
	let promiseChain = Promise.resolve();

	const write = (message: Buffer): Promise<void> => {
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

	return {write};
};
