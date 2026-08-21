import {expect, spyOn, test} from 'bun:test';
import * as childProcess from 'node:child_process';
import type {SpawnOptions} from 'node:child_process';
import {EventEmitter} from 'node:events';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {PassThrough, Readable} from 'node:stream';
import {
	STUDIO_CSRF_HEADER,
	type PackageManager,
	type RenderDefaults,
} from '@remotion/studio-shared';
import {VERSION} from 'remotion/version';
import type {LiveEventsServer} from '../preview-server/live-events';
import {
	getPackageInstallSpec,
	handleInstallPackage,
} from '../preview-server/routes/install-dependency';
import {handleRoutes} from '../routes';

type SpawnCall = {
	command: string;
	args: readonly string[];
	options: SpawnOptions;
};

const mockPackageManagerSpawn = () => {
	const calls: SpawnCall[] = [];
	const replacement = (
		command: string,
		args: readonly string[],
		options: SpawnOptions,
	) => {
		calls.push({command, args, options});
		const child = new EventEmitter() as ReturnType<typeof childProcess.spawn>;
		const stdout = new PassThrough();
		child.stdout = stdout;
		queueMicrotask(() => {
			stdout.end();
			child.emit('close', 0, null);
		});
		return child;
	};

	const spawnSpy = spyOn(childProcess, 'spawn').mockImplementation(
		replacement as typeof childProcess.spawn,
	);

	return {calls, spawnSpy};
};

test('uses the matching version for Remotion packages', () => {
	expect(getPackageInstallSpec({name: 'remotion', version: null})).toBe(
		`remotion@${VERSION}`,
	);
	expect(
		getPackageInstallSpec({name: '@remotion/effects', version: null}),
	).toBe(`@remotion/effects@${VERSION}`);
});

test('uses the supported version for unversioned catalogued packages', () => {
	expect(getPackageInstallSpec({name: 'mediabunny', version: null})).toMatch(
		/^mediabunny@\d/,
	);
});

test('lets the package manager resolve other unversioned packages', () => {
	expect(getPackageInstallSpec({name: 'lodash', version: null})).toBe('lodash');
	expect(getPackageInstallSpec({name: '@acme/video', version: null})).toBe(
		'@acme/video',
	);
});

test('uses exact declared versions for non-Remotion dependencies', () => {
	expect(getPackageInstallSpec({name: 'lodash', version: '4.17.21'})).toBe(
		'lodash@4.17.21',
	);
	expect(getPackageInstallSpec({name: 'mediabunny', version: '1.2.3'})).toBe(
		'mediabunny@1.2.3',
	);
});

test('always aligns Remotion package versions', () => {
	expect(
		getPackageInstallSpec({name: '@remotion/effects', version: '1.0.0'}),
	).toBe(`@remotion/effects@${VERSION}`);
});

test('installs without running dependency lifecycle scripts', async () => {
	const {calls: spawnCalls, spawnSpy} = mockPackageManagerSpawn();
	const lockfiles: Record<PackageManager, string> = {
		npm: 'package-lock.json',
		pnpm: 'pnpm-lock.yaml',
		yarn: 'yarn.lock',
		bun: 'bun.lock',
	};
	const temporaryDirectories: string[] = [];

	try {
		for (const manager of Object.keys(lockfiles) as PackageManager[]) {
			const remotionRoot = await mkdtemp(
				path.join(tmpdir(), `remotion-install-${manager}-`),
			);
			temporaryDirectories.push(remotionRoot);
			await writeFile(path.join(remotionRoot, lockfiles[manager]), '');
			spawnCalls.length = 0;

			await handleInstallPackage({
				binariesDirectory: null,
				configFile: null,
				entryPoint: '',
				getDefaultCodingAgent: () => null,
				getDefaultEditor: () => null,
				input: {
					dependencies: [{name: 'lodash', version: '4.17.21'}],
				},
				logLevel: 'error',
				methods: {
					addJob: () => undefined,
					cancelJob: () => undefined,
					removeJob: () => undefined,
				},
				publicDir: remotionRoot,
				remotionRoot,
				request: {} as IncomingMessage,
				response: {} as ServerResponse,
			});

			expect(spawnCalls).toHaveLength(1);
			const [call] = spawnCalls;
			expect(call.command).toBe(manager);
			if (manager === 'yarn') {
				expect(call.args).not.toContain('--ignore-scripts');
				expect(call.options.env?.YARN_ENABLE_SCRIPTS).toBe('false');
				expect(call.options.env?.YARN_IGNORE_SCRIPTS).toBe('true');
			} else {
				expect(call.args).toContain('--ignore-scripts');
			}
		}
	} finally {
		spawnSpy.mockRestore();
		await Promise.all(
			temporaryDirectories.map((directory) =>
				rm(directory, {force: true, recursive: true}),
			),
		);
	}
});

test('rejects package installation without the Studio CSRF token', async () => {
	const {calls: spawnCalls, spawnSpy} = mockPackageManagerSpawn();
	const remotionRoot = await mkdtemp(
		path.join(tmpdir(), 'remotion-install-csrf-'),
	);
	const request = Readable.from([
		JSON.stringify({
			dependencies: [{name: 'lodash', version: '4.17.21'}],
		}),
	]) as IncomingMessage;
	request.method = 'POST';
	request.url = '/api/install-package';
	request.headers = {
		host: 'localhost:3000',
		origin: 'http://localhost:3000',
		[STUDIO_CSRF_HEADER]: 'wrong-token',
	};
	let responseBody = '';
	let responseStatusCode = 0;
	const response = {
		end(chunk?: string) {
			if (chunk) {
				responseBody += chunk;
			}
		},
		setHeader() {},
		writeHead(statusCode: number) {
			responseStatusCode = statusCode;
		},
	} as unknown as ServerResponse;
	const liveEventsServer: LiveEventsServer = {
		addNewClientListener: () => () => undefined,
		closeConnections: () => Promise.resolve(),
		router: () => Promise.resolve(),
		sendEventToClient: () => undefined,
		sendEventToClientId: () => false,
	};

	try {
		spawnCalls.length = 0;
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
			studioCsrfToken: 'correct-token',
			liveEventsServer,
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

		expect(responseStatusCode).toBe(403);
		expect(JSON.parse(responseBody)).toEqual({
			success: false,
			error: 'Invalid CSRF token',
		});
		expect(spawnCalls).toHaveLength(0);
	} finally {
		spawnSpy.mockRestore();
		await rm(remotionRoot, {force: true, recursive: true});
	}
});
