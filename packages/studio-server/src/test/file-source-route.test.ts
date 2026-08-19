import {expect, test} from 'bun:test';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Readable} from 'node:stream';
import type {RenderDefaults} from '@remotion/studio-shared';
import type {LiveEventsServer} from '../preview-server/live-events';
import {handleRoutes} from '../routes';

const makeRequest = ({
	fileName,
	host,
	origin,
}: {
	fileName: string;
	host: string;
	origin?: string;
}) => {
	const request = Readable.from([]) as IncomingMessage;
	request.method = 'GET';
	request.url = `/api/file-source?f=${encodeURIComponent(fileName)}`;
	request.headers = {
		host,
	};
	if (origin) {
		request.headers.origin = origin;
	}

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

test('serves file source from an origin-less GET request', async () => {
	const remotionRoot = await mkdtemp(path.join(tmpdir(), 'remotion-source-'));
	const fileName = path.join(remotionRoot, 'index.mjs');
	await writeFile(fileName, 'export const value = 1;');

	try {
		const response = makeResponse();

		await handleRoutes({
			binariesDirectory: null,
			configFile: null,
			enableCrossSiteIsolation: false,
			entryPoint: '',
			getAudioLatencyHint: () => null,
			getExperimentalKeepAudioContextAlive: () => false,
			getCurrentInputProps: () => ({}),
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			getEnvVariables: () => ({}),
			getRenderDefaults: () => ({}) as RenderDefaults,
			getRenderQueue: () => [],
			getNumberOfAudioTags: () => 0,
			getPreviewSampleRate: () => null,
			getPublicDir: () => remotionRoot,
			getStudioRuntimeConfig: () => ({
				askAIEnabled: false,
				bufferStateDelayInMilliseconds: null,
				defaultCodingAgent: null,
				defaultEditor: null,
				interactivityEnabled: true,
				keyboardShortcutsEnabled: true,
				maxTimelineTracks: null,
				publicLicenseKey: null,
				configFileStudioSettings: null,
			}),
			gitSource: null,
			liveEventsServer: noopLiveEventsServer,
			logLevel: 'info',
			outputHash: '/outputs',
			outputHashPrefix: '/outputs',
			queueMethods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			remotionRoot,
			request: makeRequest({
				fileName,
				host: 'localhost:3000',
			}),
			response,
			staticHash: '/static',
			staticHashPrefix: '/static',
			updatePublicDir: () => undefined,
		});

		expect(response.statusCode).toBe(200);
		expect(response.body).toBe('export const value = 1;');
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
	}
});

test('activates the latest public directory when the Studio page reloads', async () => {
	const remotionRoot = await mkdtemp(path.join(tmpdir(), 'remotion-source-'));
	const firstPublicDir = path.join(remotionRoot, 'first');
	const secondPublicDir = path.join(remotionRoot, 'second');
	await mkdir(firstPublicDir);
	await mkdir(secondPublicDir);
	await writeFile(path.join(remotionRoot, 'package.json'), '{}');
	await writeFile(path.join(firstPublicDir, 'first.txt'), 'first');
	await writeFile(path.join(secondPublicDir, 'second.txt'), 'second');

	let publicDir = firstPublicDir;
	let updates = 0;
	const request = Readable.from([]) as IncomingMessage;
	request.method = 'GET';
	request.url = '/';
	request.headers = {accept: 'text/html', host: 'localhost:3000'};

	try {
		const response = makeResponse();
		await handleRoutes({
			binariesDirectory: null,
			configFile: null,
			enableCrossSiteIsolation: false,
			entryPoint: '',
			getAudioLatencyHint: () => null,
			getExperimentalKeepAudioContextAlive: () => false,
			getCurrentInputProps: () => ({}),
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			getEnvVariables: () => ({}),
			getRenderDefaults: () => ({}) as RenderDefaults,
			getRenderQueue: () => [],
			getNumberOfAudioTags: () => 0,
			getPreviewSampleRate: () => null,
			getPublicDir: () => publicDir,
			getStudioRuntimeConfig: () => ({
				askAIEnabled: false,
				bufferStateDelayInMilliseconds: null,
				defaultCodingAgent: null,
				defaultEditor: null,
				interactivityEnabled: true,
				keyboardShortcutsEnabled: true,
				maxTimelineTracks: null,
				publicLicenseKey: null,
				configFileStudioSettings: null,
			}),
			gitSource: null,
			liveEventsServer: noopLiveEventsServer,
			logLevel: 'info',
			outputHash: '/outputs',
			outputHashPrefix: '/outputs',
			queueMethods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			remotionRoot,
			request,
			response,
			staticHash: '/static',
			staticHashPrefix: '/static',
			updatePublicDir: () => {
				updates++;
				publicDir = secondPublicDir;
			},
		});

		expect(updates).toBe(1);
		expect(response.body).toContain('second.txt');
		expect(response.body).not.toContain('first.txt');
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
	}
});
