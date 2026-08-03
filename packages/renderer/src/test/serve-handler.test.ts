import {expect, test} from 'bun:test';
import {once} from 'node:events';
import type {IncomingMessage, ServerResponse} from 'node:http';
import path from 'node:path';
import {PassThrough} from 'node:stream';
import {serveHandler} from '../serve-handler';

test('does not serve a file after the response has closed', async () => {
	const response = new PassThrough();
	response.destroy();
	await once(response, 'close');

	let headersWritten = false;
	const serverResponse = Object.assign(response, {
		statusCode: 200,
		writeHead: () => {
			headersWritten = true;
			return serverResponse;
		},
	}) as unknown as ServerResponse;

	await serveHandler(
		{
			url: '/test/serve-handler.test.ts',
			headers: {host: 'localhost'},
		} as IncomingMessage,
		serverResponse,
		{public: path.join(__dirname, '..')},
	);

	expect(headersWritten).toBe(false);
});
