import type {ClientRequest} from 'http';

export const setSocketTimeout = (
	request: ClientRequest,
	reject: (err: Error) => void,
	timeoutInMs = 0,
) => {
	request.setTimeout(timeoutInMs, () => {
		// destroy the request
		request.destroy();
		reject(
			Object.assign(new Error(`Connection timed out after ${timeoutInMs} ms`), {
				name: 'TimeoutError',
			}),
		);
	});
};
