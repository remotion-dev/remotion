import {expect, test} from 'bun:test';
import {
	mkdir,
	mkdtemp,
	readFile,
	rm,
	symlink,
	writeFile,
} from 'node:fs/promises';
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

const requestWriteRoute = async ({
	remotionRoot,
	publicDir,
	filePath,
	body,
	route,
}: {
	remotionRoot: string;
	publicDir: string;
	filePath: string;
	body: string;
	route: 'add-asset' | 'upload-output';
}) => {
	const request = Readable.from([body]) as IncomingMessage;
	request.method = 'POST';
	request.url = `${
		route === 'add-asset' ? '/static/api/add-asset' : '/api/upload-output'
	}?filePath=${encodeURIComponent(filePath)}`;
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
		publicDir,
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
		const response = await requestWriteRoute({
			body: 'video contents',
			filePath: 'output.mp4',
			publicDir: remotionRoot,
			remotionRoot,
			route: 'upload-output',
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
		const response = await requestWriteRoute({
			body: 'malicious config',
			filePath: 'remotion.config.ts',
			publicDir: remotionRoot,
			remotionRoot,
			route: 'upload-output',
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
		const response = await requestWriteRoute({
			body: 'malicious config',
			filePath: 'output.mp4',
			publicDir: remotionRoot,
			remotionRoot,
			route: 'upload-output',
		});

		expect(response.responseStatusCode).toBe(500);
		expect(await readFile(configFile, 'utf8')).toBe('safe config');
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
	}
});

test('does not follow parent-directory symlinks when uploading render output', async () => {
	if (process.platform === 'win32') {
		return;
	}

	const remotionRoot = await mkdtemp(
		path.join(tmpdir(), 'remotion-upload-parent-symlink-'),
	);
	const outsideDirectory = await mkdtemp(
		path.join(tmpdir(), 'remotion-upload-outside-'),
	);
	const outsideFile = path.join(outsideDirectory, 'output.mp4');
	await writeFile(outsideFile, 'safe contents');
	await symlink(outsideDirectory, path.join(remotionRoot, 'linked-output'));

	try {
		const response = await requestWriteRoute({
			body: 'malicious contents',
			filePath: 'linked-output/output.mp4',
			publicDir: remotionRoot,
			remotionRoot,
			route: 'upload-output',
		});

		expect(response.responseStatusCode).toBe(500);
		expect(await readFile(outsideFile, 'utf8')).toBe('safe contents');
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
		await rm(outsideDirectory, {force: true, recursive: true});
	}
});

test('writes normal static assets without following symlinks', async () => {
	if (process.platform === 'win32') {
		return;
	}

	const remotionRoot = await mkdtemp(
		path.join(tmpdir(), 'remotion-add-asset-'),
	);
	const publicDir = path.join(remotionRoot, 'public');
	const outsideDirectory = await mkdtemp(
		path.join(tmpdir(), 'remotion-add-asset-outside-'),
	);
	const finalSymlinkTarget = path.join(outsideDirectory, 'final.png');
	const parentSymlinkTarget = path.join(outsideDirectory, 'parent.png');
	await mkdir(publicDir);
	await writeFile(finalSymlinkTarget, 'safe final contents');
	await writeFile(parentSymlinkTarget, 'safe parent contents');
	await symlink(finalSymlinkTarget, path.join(publicDir, 'final.png'));
	await symlink(outsideDirectory, path.join(publicDir, 'linked-assets'));

	try {
		const normalResponse = await requestWriteRoute({
			body: 'normal contents',
			filePath: 'nested/normal.png',
			publicDir,
			remotionRoot,
			route: 'add-asset',
		});
		const finalSymlinkResponse = await requestWriteRoute({
			body: 'malicious final contents',
			filePath: 'final.png',
			publicDir,
			remotionRoot,
			route: 'add-asset',
		});
		const parentSymlinkResponse = await requestWriteRoute({
			body: 'malicious parent contents',
			filePath: 'linked-assets/parent.png',
			publicDir,
			remotionRoot,
			route: 'add-asset',
		});

		expect(JSON.parse(normalResponse.responseBody)).toEqual({success: true});
		expect(
			await readFile(path.join(publicDir, 'nested/normal.png'), 'utf8'),
		).toBe('normal contents');
		expect(finalSymlinkResponse.responseStatusCode).toBe(500);
		expect(parentSymlinkResponse.responseStatusCode).toBe(500);
		expect(await readFile(finalSymlinkTarget, 'utf8')).toBe(
			'safe final contents',
		);
		expect(await readFile(parentSymlinkTarget, 'utf8')).toBe(
			'safe parent contents',
		);
	} finally {
		await rm(remotionRoot, {force: true, recursive: true});
		await rm(outsideDirectory, {force: true, recursive: true});
	}
});
