import {expect, test} from 'bun:test';
import {once} from 'node:events';
import {promises} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {PassThrough} from 'node:stream';
import {serveHandler} from '../serve-handler';

test('does not serve a file after the response has closed', async () => {
	const temporaryDirectory = await promises.mkdtemp(
		path.join(os.tmpdir(), 'remotion-serve-handler-'),
	);
	await promises.writeFile(path.join(temporaryDirectory, 'video.mp4'), 'video');

	try {
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
				url: '/video.mp4',
				headers: {host: 'localhost'},
			} as IncomingMessage,
			serverResponse,
			{public: temporaryDirectory},
		);

		expect(headersWritten).toBe(false);
	} finally {
		await promises.rm(temporaryDirectory, {recursive: true, force: true});
	}
});
