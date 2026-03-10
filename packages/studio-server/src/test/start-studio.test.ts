import {afterEach, beforeAll, expect, mock, test} from 'bun:test';
import type {WebpackOverrideFn} from '@remotion/bundler';
import type {RenderDefaults} from '@remotion/studio-shared';
import type {signalRestart as SignalRestartFn} from '../preview-server/close-and-restart';
import type {startStudio as StartStudioFn} from '../start-studio';

const closeConnectionsMock = mock(() => Promise.resolve(undefined));
const cleanupLiveEventsListenerMock = mock(() => undefined);
const startServerCloseMock = mock(() => Promise.resolve(undefined));
const startServerMock = mock(() =>
	Promise.resolve({
		type: 'started' as const,
		port: 3100,
		liveEventsServer: {
			closeConnections: closeConnectionsMock,
		},
		close: startServerCloseMock,
	}),
);

mock.module('../preview-server/start-server', () => ({
	startServer: startServerMock,
}));

mock.module('../get-network-address', () => ({
	getNetworkAddress: () => null,
}));

mock.module('../maybe-open-browser', () => ({
	maybeOpenBrowser: mock(() => Promise.resolve({didOpenBrowser: false})),
}));

mock.module('../preview-server/public-folder', () => ({
	getFiles: () => [],
	initPublicFolderWatch: () => undefined,
}));

mock.module('../preview-server/live-events', () => ({
	setLiveEventsListener: () => cleanupLiveEventsListenerMock,
	waitForLiveEventsListener: () =>
		Promise.resolve({
			sendEventToClient: () => undefined,
		}),
}));

mock.module('../preview-server/get-absolute-public-dir', () => ({
	getAbsolutePublicDir: () => '/tmp/public',
}));

mock.module('../server-ready', () => ({
	printServerReadyComment: () => undefined,
	setServerReadyComment: () => undefined,
}));

mock.module('../watch-root-file', () => ({
	watchRootFile: () => undefined,
}));

mock.module('@remotion/renderer', () => ({
	RenderInternals: {
		Log: {
			info: () => undefined,
			verbose: () => undefined,
			error: () => undefined,
		},
		chalk: {
			blue: (text: string) => text,
			underline: (text: string) => text,
		},
	},
}));

let startStudio: typeof StartStudioFn;
let signalRestart: typeof SignalRestartFn;

const getOptions = () => ({
	browserArgs: '',
	browserFlag: '',
	shouldOpenBrowser: false,
	fullEntryPath: '/tmp/project/src/index.ts',
	logLevel: 'info' as const,
	getCurrentInputProps: () => ({}),
	getEnvVariables: () => ({}),
	desiredPort: null,
	maxTimelineTracks: null,
	remotionRoot: '/tmp/project',
	keyboardShortcutsEnabled: true,
	experimentalClientSideRenderingEnabled: false,
	experimentalVisualModeEnabled: false,
	relativePublicDir: null,
	webpackOverride: ((config) => config) satisfies WebpackOverrideFn,
	poll: null,
	getRenderDefaults: () => ({}) as RenderDefaults,
	getRenderQueue: () => [],
	numberOfAudioTags: 1,
	queueMethods: {
		addJob: () => undefined,
		cancelJob: () => undefined,
		removeJob: () => undefined,
	},
	previewEntry: '/tmp/preview-entry.js',
	studioPackageAliasPath: '/tmp/studio/index.js',
	gitSource: null,
	bufferStateDelayInMilliseconds: null,
	binariesDirectory: null,
	forceIPv4: false,
	audioLatencyHint: null,
	enableCrossSiteIsolation: false,
	askAIEnabled: false,
	forceNew: false,
	rspack: false,
});

beforeAll(async () => {
	({startStudio} = await import('../start-studio'));
	({signalRestart} = await import('../preview-server/close-and-restart'));
});

afterEach(() => {
	closeConnectionsMock.mockReset();
	closeConnectionsMock.mockImplementation(() => Promise.resolve(undefined));
	cleanupLiveEventsListenerMock.mockReset();
	cleanupLiveEventsListenerMock.mockImplementation(() => undefined);
	startServerCloseMock.mockReset();
	startServerCloseMock.mockImplementation(() => Promise.resolve(undefined));
	startServerMock.mockReset();
	startServerMock.mockImplementation(() =>
		Promise.resolve({
			type: 'started' as const,
			port: 3100,
			liveEventsServer: {
				closeConnections: closeConnectionsMock,
			},
			close: startServerCloseMock,
		}),
	);
});

test('startStudio closes the server gracefully', async () => {
	const result = await startStudio(getOptions());

	expect(result.type).toBe('new-instance');
	if (result.type !== 'new-instance') {
		throw new Error('Expected a new Studio instance');
	}

	const waitForExit = result.waitForExit();
	await result.close();

	expect(await waitForExit).toBe('close');
	expect(closeConnectionsMock).toHaveBeenCalledTimes(1);
	expect(cleanupLiveEventsListenerMock).toHaveBeenCalledTimes(1);
	expect(startServerCloseMock).toHaveBeenCalledTimes(1);
});

test('startStudio restarts through the same cleanup path', async () => {
	const result = await startStudio(getOptions());

	expect(result.type).toBe('new-instance');
	if (result.type !== 'new-instance') {
		throw new Error('Expected a new Studio instance');
	}

	const waitForExit = result.waitForExit();
	signalRestart();

	expect(await waitForExit).toBe('restart');
	expect(closeConnectionsMock).toHaveBeenCalledTimes(1);
	expect(cleanupLiveEventsListenerMock).toHaveBeenCalledTimes(1);
	expect(startServerCloseMock).toHaveBeenCalledTimes(1);
});
