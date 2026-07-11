import {expect, test} from 'bun:test';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Readable} from 'node:stream';
import type {RenderDefaults} from '@remotion/studio-shared';
import type {LiveEventsServer} from '../preview-server/live-events';
import {handleRoutes} from '../routes';

const makeRequest = ({
	body,
	host,
	origin,
}: {
	body: unknown;
	host: string;
	origin: string;
}) => {
	const request = Readable.from([JSON.stringify(body)]) as IncomingMessage;
	request.method = 'POST';
	request.url = '/api/file-source';
	request.headers = {
		host,
		origin,
	};

	return request;
};

const makeResponse = () => {
	const response = {
		body: '',
		statusCode: 0,
		end(chunk?: string) {
			if (chunk) {
				this.body += chunk;
			}
		},
		setHeader() {},
		write(chunk: string) {
			this.body += chunk;
		},
		writeHead(statusCode: number) {
			this.statusCode = statusCode;
		},
	};

	return response as ServerResponse & typeof response;
};

const noopLiveEventsServer: LiveEventsServer = {
	addNewClientListener: () => () => undefined,
	closeConnections: () => Promise.resolve(),
	router: () => Promise.resolve(),
	sendEventToClient: () => undefined,
	sendEventToClientId: () => false,
};

test('serves file source from a same-origin POST request', async () => {
	const remotionRoot = await mkdtemp(path.join(tmpdir(), 'remotion-source-'));
	const fileName = path.join(remotionRoot, 'index.mjs');
	await writeFile(fileName, 'export const value = 1;');

	try {
		const response = makeResponse();

		await handleRoutes({
			audioLatencyHint: null,
			binariesDirectory: null,
			enableCrossSiteIsolation: false,
			entryPoint: '',
			getCurrentInputProps: () => ({}),
			getEnvVariables: () => ({}),
			getRenderDefaults: () => ({}) as RenderDefaults,
			getRenderQueue: () => [],
			gitSource: null,
			liveEventsServer: noopLiveEventsServer,
			logLevel: 'info',
			numberOfAudioTags: 0,
			outputHash: '/outputs',
			outputHashPrefix: '/outputs',
			previewSampleRate: null,
			publicDir: remotionRoot,
			queueMethods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			remotionRoot,
			request: makeRequest({
				body: {fileName},
				host: 'localhost:3000',
				origin: 'http://localhost:3000',
			}),
			response,
			staticHash: '/static',
			staticHashPrefix: '/static',
		});

		expect(response.statusCode).toBe(200);
		expect(response.body).toBe('export const value = 1;');
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
	}
});
