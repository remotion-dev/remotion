import {expect, test} from 'bun:test';
import {mkdtemp, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Readable} from 'node:stream';
import {STUDIO_CSRF_HEADER, type RenderDefaults} from '@remotion/studio-shared';
import type {LiveEventsServer} from '../preview-server/live-events';
import {handleRoutes} from '../routes';

const makeLiveEventsServer = (): LiveEventsServer => ({
	addNewClientListener: () => () => undefined,
	closeConnections: () => Promise.resolve(),
	router: () => Promise.resolve(),
	sendEventToClient: () => undefined,
	sendEventToClientId: () => false,
});

const requestRoute = async ({
	remotionRoot,
	url,
	body,
	csrfToken,
}: {
	remotionRoot: string;
	url: string;
	body: string;
	csrfToken?: string;
}) => {
	const request = Readable.from([body]) as IncomingMessage;
	request.method = 'POST';
	request.url = url;
	request.headers = {
		host: 'localhost:3000',
		origin: 'http://localhost:3000',
		...(csrfToken ? {[STUDIO_CSRF_HEADER]: csrfToken} : {}),
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
		studioCsrfToken: 'correct-token',
	});
	await responseEnded;

	return {responseBody, responseStatusCode};
};

test('rejects output uploads without the Studio CSRF token', async () => {
	const remotionRoot = await mkdtemp(
		path.join(tmpdir(), 'remotion-upload-csrf-'),
	);
	const configFile = path.join(remotionRoot, 'remotion.config.ts');
	await writeFile(configFile, 'safe config');

	try {
		const response = await requestRoute({
			body: 'malicious config',
			remotionRoot,
			url: '/api/upload-output?filePath=remotion.config.ts',
		});

		expect(response.responseStatusCode).toBe(403);
		expect(JSON.parse(response.responseBody)).toEqual({
			success: false,
			error: 'Invalid CSRF token',
		});
		expect(await readFile(configFile, 'utf8')).toBe('safe config');
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
	}
});

test('rejects config uploads even with the Studio CSRF token', async () => {
	const remotionRoot = await mkdtemp(
		path.join(tmpdir(), 'remotion-upload-config-'),
	);
	const configFile = path.join(remotionRoot, 'remotion.config.ts');
	await writeFile(configFile, 'safe config');

	try {
		const response = await requestRoute({
			body: 'malicious config',
			csrfToken: 'correct-token',
			remotionRoot,
			url: '/api/upload-output?filePath=remotion.config.ts',
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
		const response = await requestRoute({
			body: 'malicious config',
			csrfToken: 'correct-token',
			remotionRoot,
			url: '/api/upload-output?filePath=output.mp4',
		});

		expect(response.responseStatusCode).toBe(500);
		expect(await readFile(configFile, 'utf8')).toBe('safe config');
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
	}
});

test('rejects Studio restarts without the Studio CSRF token', async () => {
	const response = await requestRoute({
		body: '{}',
		remotionRoot: process.cwd(),
		url: '/api/restart-studio',
	});

	expect(response.responseStatusCode).toBe(403);
	expect(JSON.parse(response.responseBody)).toEqual({
		success: false,
		error: 'Invalid CSRF token',
	});
});
