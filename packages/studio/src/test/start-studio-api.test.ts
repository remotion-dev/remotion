import {afterEach, beforeAll, expect, mock, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {StartStudioOptions, StudioServer} from '../node';

const launchStudioSessionMock = mock();
const loadConfigMock = mock(() => Promise.resolve(null));
const findEntryPointMock = mock(() => ({
	file: path.resolve(process.cwd(), 'src/index.ts'),
	reason: 'argument passed',
}));
const getEnvironmentVariablesMock = mock(() => ({FROM_CONFIG: 'true'}));
const getConfiguredRenderDefaultsMock = mock(() => ({codec: 'h264'}));

mock.module('@remotion/studio-server', () => ({
	ConfigInternals: {
		getEntryPoint: () => null,
		getStudioPort: () => null,
		getConfiguredPublicDir: () => null,
		getWebpackOverrideFn: () => (config: unknown) => config,
		getWebpackPolling: () => null,
		getMaxTimelineTracks: () => null,
		getBufferStateDelayInMilliseconds: () => null,
		getConfiguredKeyboardShortcutsEnabled: () => true,
		getConfiguredExperimentalClientSideRenderingEnabled: () => false,
		getConfiguredExperimentalVisualModeEnabled: () => false,
		getConfiguredNumberOfSharedAudioTags: () => 0,
		getConfiguredBinariesDirectory: () => null,
		getConfiguredIPv4: () => false,
		getConfiguredAudioLatencyHint: () => null,
		getConfiguredEnableCrossSiteIsolation: () => false,
		getConfiguredAskAIEnabled: () => true,
		getConfiguredForceNewStudio: () => false,
		getConfiguredRspackEnabled: () => false,
		getRendererPortFromConfigFile: () => null,
		getConfiguredBrowserExecutable: () => null,
		getFfmpegOverrideFunction: () => undefined,
		getWebpackCaching: () => true,
		getConfiguredOverrideWidth: () => null,
		getConfiguredOverrideHeight: () => null,
		getConfiguredOverrideFps: () => null,
		getConfiguredOverrideDuration: () => null,
		getConfiguredImageSequencePattern: () => null,
	},
	findEntryPoint: findEntryPointMock,
	getConfiguredRenderDefaults: getConfiguredRenderDefaultsMock,
	getEnvironmentVariables: getEnvironmentVariablesMock,
	launchStudioSession: launchStudioSessionMock,
	loadConfig: loadConfigMock,
}));

let startStudio: (options?: StartStudioOptions) => Promise<StudioServer>;

beforeAll(async () => {
	({startStudio} = await import('../node'));
});

afterEach(() => {
	launchStudioSessionMock.mockReset();
	loadConfigMock.mockReset();
	findEntryPointMock.mockReset();
	getEnvironmentVariablesMock.mockReset();
	getConfiguredRenderDefaultsMock.mockReset();
	loadConfigMock.mockResolvedValue(null);
	findEntryPointMock.mockReturnValue({
		file: path.resolve(process.cwd(), 'src/index.ts'),
		reason: 'argument passed',
	});
	getEnvironmentVariablesMock.mockReturnValue({FROM_CONFIG: 'true'});
	getConfiguredRenderDefaultsMock.mockReturnValue({codec: 'h264'});
});

function createTempRemotionProject(): string {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-studio-api-'));
	fs.mkdirSync(path.join(root, 'src'));
	fs.writeFileSync(path.join(root, 'src', 'index.ts'), 'export {};');
	return root;
}

test('startStudio() forwards options and returns a closable handle', async () => {
	const closeMock = mock(() => Promise.resolve(undefined));
	launchStudioSessionMock.mockResolvedValue({
		type: 'new-instance',
		port: 4321,
		close: closeMock,
		waitForExit: () => Promise.resolve('close'),
	});

	const tmp = createTempRemotionProject();

	try {
		const result = await startStudio({
			remotionRoot: tmp,
			entryPoint: 'src/index.ts',
			openBrowser: false,
			port: 4321,
		});

		expect(result).toEqual({
			url: 'http://localhost:4321',
			port: 4321,
			reusedExistingStudio: false,
			close: closeMock,
		});
		expect(loadConfigMock).toHaveBeenCalledWith({remotionRoot: tmp});
		expect(findEntryPointMock).toHaveBeenCalled();
		expect(launchStudioSessionMock).toHaveBeenCalledTimes(1);

		const [params] = launchStudioSessionMock.mock.calls[0] as [
			Parameters<typeof launchStudioSessionMock>[0],
		];
		expect(params.spec.remotionRoot).toBe(tmp);
		expect(params.spec.entryPoint).toMatch(/src[\\/]index\.ts$/);
		expect(params.spec.desiredPort).toBe(4321);
		expect(params.spec.shouldOpenBrowser).toBe(false);
		expect(params.runtimeSources.getCurrentInputProps()).toEqual({});
		expect(params.runtimeSources.getEnvVariables()).toEqual({
			FROM_CONFIG: 'true',
		});
		expect(params.runtimeSources.getRenderDefaults()).toEqual({codec: 'h264'});

		if (result.reusedExistingStudio) {
			throw new Error('Expected a new Studio instance');
		}

		await result.close();
		expect(closeMock).toHaveBeenCalledTimes(1);
	} finally {
		fs.rmSync(tmp, {recursive: true, force: true});
	}
});

test('startStudio() returns already-running metadata without a close handle', async () => {
	launchStudioSessionMock.mockResolvedValue({
		type: 'already-running',
		port: 3000,
	});

	const tmp = createTempRemotionProject();

	try {
		const result = await startStudio({
			remotionRoot: tmp,
			openBrowser: false,
		});

		expect(result).toEqual({
			url: 'http://localhost:3000',
			port: 3000,
			reusedExistingStudio: true,
		});
		expect(launchStudioSessionMock).toHaveBeenCalledTimes(1);
	} finally {
		fs.rmSync(tmp, {recursive: true, force: true});
	}
});

test('startStudio() can force a new instance instead of reusing an existing one', async () => {
	const closeMock = mock(() => Promise.resolve(undefined));
	launchStudioSessionMock.mockResolvedValue({
		type: 'new-instance',
		port: 4555,
		close: closeMock,
		waitForExit: () => Promise.resolve('close'),
	});

	const tmp = createTempRemotionProject();

	try {
		const result = await startStudio({
			remotionRoot: tmp,
			reuseExistingStudio: false,
		});

		expect(result).toEqual({
			url: 'http://localhost:4555',
			port: 4555,
			reusedExistingStudio: false,
			close: closeMock,
		});
		const [params] = launchStudioSessionMock.mock.calls[0] as [
			Parameters<typeof launchStudioSessionMock>[0],
		];
		expect(params.spec.forceNew).toBe(true);
	} finally {
		fs.rmSync(tmp, {recursive: true, force: true});
	}
});
