import {beforeAll, expect, mock, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type * as ParsedCliModule from '../parsed-cli';
import type * as StudioModule from '../studio';

const launchStudioSessionMock = mock();

mock.module('@remotion/studio-server', () => ({
	Config: {
		setPort: () => undefined,
		setStudioPort: () => undefined,
		setRendererPort: () => undefined,
	},
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
		getMetadata: () => ({}),
		getOutputLocation: () => null,
		getOutputCodecOrUndefined: () => null,
	},
	StudioServerInternals: {
		getMaxTimelineTracks: () => null,
		setMaxTimelineTracks: () => undefined,
		installFileWatcher: () => ({unwatch: () => undefined}),
		waitForLiveEventsListener: () =>
			Promise.resolve({
				sendEventToClient: () => undefined,
			}),
	},
	launchStudioSession: launchStudioSessionMock,
}));

let startStudioCommand: typeof StudioModule.startStudioCommand;
let parseCommandLineArguments: typeof ParsedCliModule.parseCommandLineArguments;

beforeAll(async () => {
	({startStudioCommand} = await import('../studio'));
	({parseCommandLineArguments} = await import('../parsed-cli'));
});

test('startStudioCommand wires render queue methods for a functional Studio', async () => {
	launchStudioSessionMock.mockResolvedValue({
		type: 'already-running',
		port: 3000,
	});

	const tmp = fs.mkdtempSync(
		path.join(os.tmpdir(), 'remotion-studio-startup-'),
	);
	fs.mkdirSync(path.join(tmp, 'src'));
	fs.writeFileSync(path.join(tmp, 'src', 'index.ts'), 'export {};');

	try {
		await startStudioCommand(tmp, ['src/index.ts'], 'info', {
			commandLine: parseCommandLineArguments(['--no-open']),
			exitBehavior: 'throw',
		});

		expect(launchStudioSessionMock).toHaveBeenCalledTimes(1);
		const [params] = launchStudioSessionMock.mock.calls[0] as [
			Parameters<typeof launchStudioSessionMock>[0],
		];

		expect(params.runtimeSources.getCurrentInputProps()).toEqual({});
		expect(params.runtimeSources.getEnvVariables()).toBeDefined();
		expect(params.runtimeSources.getRenderDefaults()).toBeDefined();
	} finally {
		fs.rmSync(tmp, {recursive: true, force: true});
		launchStudioSessionMock.mockReset();
	}
});
