import type {IncomingMessage} from 'node:http';

export class RequestBodyTooLargeError extends Error {
	constructor(maxBytes: number) {
		super(`Request body exceeds the limit of ${maxBytes} bytes`);
		this.name = 'RequestBodyTooLargeError';
	}
}

export const parseRequestBody = async (
	req: IncomingMessage,
	{
		maxBytes,
	}: {
		readonly maxBytes: number | null;
	},
): Promise<unknown> => {
	const body = await new Promise<string>((resolve, reject) => {
		const decoder = new TextDecoder();
		const encoder = new TextEncoder();
		let data = '';
		let receivedBytes = 0;
		let settled = false;

		const cleanup = () => {
			req.off('aborted', onAborted);
			req.off('data', onData);
			req.off('end', onEnd);
			req.off('error', onError);
		};

		const rejectOnce = (error: Error) => {
			if (settled) {
				return;
			}

			settled = true;
			cleanup();
			reject(error);
		};

		const onAborted = () => rejectOnce(new Error('Request body was aborted'));
		const onData = (chunk: Uint8Array | string) => {
			receivedBytes +=
				typeof chunk === 'string'
					? encoder.encode(chunk).byteLength
					: chunk.byteLength;
			if (maxBytes !== null && receivedBytes > maxBytes) {
				rejectOnce(new RequestBodyTooLargeError(maxBytes));
				// Discard the rest without buffering it. Keep request stream errors from
				// becoming unhandled after the parser listeners have been removed.
				req.on('error', () => undefined);
				req.resume();
				return;
			}

			data +=
				typeof chunk === 'string'
					? decoder.decode() + chunk
					: decoder.decode(chunk, {stream: true});
		};

		const onEnd = () => {
			if (settled) {
				return;
			}

			settled = true;
			cleanup();
			resolve(data + decoder.decode());
		};

		const onError = (error: Error) => rejectOnce(error);

		req.on('aborted', onAborted);
		req.on('data', onData);
		req.on('end', onEnd);
		req.on('error', onError);
	});

	return JSON.parse(body);
};
