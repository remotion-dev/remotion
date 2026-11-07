import {spyOn} from 'bun:test';
import {EventEmitter} from 'node:events';
import type {IncomingMessage} from 'node:http';
import https from 'node:https';
import {PassThrough} from 'node:stream';

// The remote server is an external boundary, so only `https.get` is faked.
export const fakeHttps = (
	respond: (url: string) => {
		statusCode: number;
		headers: Record<string, string | undefined>;
		body: Uint8Array | null;
	},
) => {
	const requestedUrls: string[] = [];
	const spy = spyOn(https, 'get').mockImplementation(((
		url: URL,
		_options: unknown,
		callback: (response: IncomingMessage) => void,
	) => {
		requestedUrls.push(url.toString());
		const {statusCode, headers, body} = respond(url.toString());
		const response = Object.assign(new PassThrough(), {
			statusCode,
			headers,
			complete: false,
		});
		response.on('end', () => {
			response.complete = true;
		});
		queueMicrotask(() => {
			callback(response as unknown as IncomingMessage);
			response.end(body === null ? undefined : Buffer.from(body));
		});
		return new EventEmitter();
	}) as unknown as typeof https.get);

	return {requestedUrls, restore: () => spy.mockRestore()};
};
