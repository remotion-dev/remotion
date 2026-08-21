import {expect, test} from 'bun:test';
import {mkdtemp, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Readable} from 'node:stream';
import type {RenderDefaults} from '@remotion/studio-shared';
import type {LiveEventsServer} from '../preview-server/live-events';
import {handleRoutes} from '../routes';

const makeLiveEventsServer = (): LiveEventsServer => ({
	addNewClientListener: () => () => undefined,
	closeConnections: () => Promise.resolve(),
	router: () => Promise.resolve(),
	sendEventToClient: () => undefined,
	sendEventToClientId: () => false,
});

const requestUpload = async ({
	remotionRoot,
	filePath,
	body,
}: {
	remotionRoot: string;
	filePath: string;
	body: string;
}) => {
	const request = Readable.from([body]) as IncomingMessage;
	request.method = 'POST';
	request.url = `/api/upload-output?filePath=${encodeURIComponent(filePath)}`;
	request.headers = {
		host: 'localhost:3000',
		origin: 'http://localhost:3000',
	};
	let responseBody = '';
	let responseStatusCode = 0;
	let resolveResponse: () => void = () => undefined;
	const responseEnded = new Promise<void>((resolve) => {
		resolveResponse = resolve;
	});
	const response = {
		get statusCode() {
			return responseStatusCode;
		},
		set statusCode(value: number) {
			responseStatusCode = value;
		},
		end(chunk?: string) {
			if (chunk) {
				responseBody += chunk;
			}

			resolveResponse();
		},
		setHeader() {},
		writeHead(statusCode: number) {
			responseStatusCode = statusCode;
		},
	} as unknown as ServerResponse;

	await handleRoutes({
		binariesDirectory: null,
		configFile: null,
		enableCrossSiteIsolation: false,
		entryPoint: '',
		getAudioLatencyHint: () => null,
		getCurrentInputProps: () => ({}),
		getDefaultCodingAgent: () => null,
		getDefaultEditor: () => null,
		getEnvVariables: () => ({}),
		getExperimentalKeepAudioContextAlive: () => false,
		getNumberOfAudioTags: () => 0,
		getPreviewSampleRate: () => null,
		getRenderDefaults: () => ({}) as RenderDefaults,
		getRenderQueue: () => [],
		getStudioRuntimeConfig: () => ({
			askAIEnabled: false,
			bufferStateDelayInMilliseconds: null,
			configFileStudioSettings: null,
			defaultCodingAgent: null,
			defaultEditor: null,
			interactivityEnabled: true,
			keyboardShortcutsEnabled: true,
			maxTimelineTracks: null,
			publicLicenseKey: null,
		}),
		gitSource: null,
		liveEventsServer: makeLiveEventsServer(),
		logLevel: 'error',
		outputHash: '/outputs',
		outputHashPrefix: '/outputs',
		publicDir: remotionRoot,
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
	});
	await responseEnded;

	return {responseBody, responseStatusCode};
};

test('uploads supported render output files', async () => {
	const remotionRoot = await mkdtemp(
		path.join(tmpdir(), 'remotion-upload-output-'),
	);

	try {
		const response = await requestUpload({
			body: 'video contents',
			filePath: 'output.mp4',
			remotionRoot,
		});

		expect(JSON.parse(response.responseBody)).toEqual({success: true});
		expect(await readFile(path.join(remotionRoot, 'output.mp4'), 'utf8')).toBe(
			'video contents',
		);
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
	}
});

test('rejects config files as render output', async () => {
	const remotionRoot = await mkdtemp(
		path.join(tmpdir(), 'remotion-upload-config-'),
	);
	const configFile = path.join(remotionRoot, 'remotion.config.ts');
	await writeFile(configFile, 'safe config');

	try {
		const response = await requestUpload({
			body: 'malicious config',
			filePath: 'remotion.config.ts',
			remotionRoot,
		});

		expect(response.responseStatusCode).toBe(500);
		expect(JSON.parse(response.responseBody)).toEqual({
			error: 'Not allowed to upload a .ts file',
		});
		expect(await readFile(configFile, 'utf8')).toBe('safe config');
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
	}
});

test('does not follow symlinks when uploading render output', async () => {
	if (process.platform === 'win32') {
		return;
	}

	const remotionRoot = await mkdtemp(
		path.join(tmpdir(), 'remotion-upload-symlink-'),
	);
	const configFile = path.join(remotionRoot, 'remotion.config.ts');
	const outputFile = path.join(remotionRoot, 'output.mp4');
	await writeFile(configFile, 'safe config');
	await symlink(configFile, outputFile);

	try {
		const response = await requestUpload({
			body: 'malicious config',
			filePath: 'output.mp4',
			remotionRoot,
		});

		expect(response.responseStatusCode).toBe(500);
		expect(await readFile(configFile, 'utf8')).toBe('safe config');
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
	}
});
