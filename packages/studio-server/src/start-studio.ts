import type {WebpackOverrideFn} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	GitSource,
	RenderDefaults,
	RenderJob,
} from '@remotion/studio-shared';
import crypto from 'node:crypto';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {getNetworkAddress} from './get-network-address';
import {maybeOpenBrowser} from './maybe-open-browser';
import type {QueueMethods} from './preview-server/api-types';
import {noOpUntilRestart} from './preview-server/close-and-restart';
import {getAbsolutePublicDir} from './preview-server/get-absolute-public-dir';
import {
	setLiveEventsListener,
	waitForLiveEventsListener,
} from './preview-server/live-events';
import {getFiles, initPublicFolderWatch} from './preview-server/public-folder';
import {startServer} from './preview-server/start-server';
import {printServerReadyComment, setServerReadyComment} from './server-ready';
import {watchRootFile} from './watch-root-file';

export type StartStudioResult = {type: 'restarted'} | {type: 'already-running'};

export const startStudio = async ({
	browserArgs,
	browserFlag,
	configValueShouldOpenBrowser,
	fullEntryPath,
	logLevel,
	getCurrentInputProps,
	getEnvVariables,
	desiredPort,
	maxTimelineTracks,
	remotionRoot,
	keyboardShortcutsEnabled,
	experimentalClientSideRenderingEnabled,
	relativePublicDir,
	webpackOverride,
	poll,
	getRenderDefaults,
	getRenderQueue,
	numberOfAudioTags,
	queueMethods,
	parsedCliOpen,
	previewEntry,
	gitSource,
	bufferStateDelayInMilliseconds,
	binariesDirectory,
	forceIPv4,
	audioLatencyHint,
	enableCrossSiteIsolation,
	askAIEnabled,
	forceNew,
}: {
	browserArgs: string;
	browserFlag: string;
	logLevel: LogLevel;
	configValueShouldOpenBrowser: boolean;
	fullEntryPath: string;
	getCurrentInputProps: () => object;
	getEnvVariables: () => Record<string, string>;
	desiredPort: number | null;
	maxTimelineTracks: number | null;
	bufferStateDelayInMilliseconds: number | null;
	remotionRoot: string;
	keyboardShortcutsEnabled: boolean;
	experimentalClientSideRenderingEnabled: boolean;
	relativePublicDir: string | null;
	webpackOverride: WebpackOverrideFn;
	poll: number | null;
	getRenderDefaults: () => RenderDefaults;
	getRenderQueue: () => RenderJob[];
	numberOfAudioTags: number;
	audioLatencyHint: AudioContextLatencyCategory | null;
	enableCrossSiteIsolation: boolean;
	queueMethods: QueueMethods;
	parsedCliOpen: boolean;
	previewEntry: string;
	gitSource: GitSource | null;
	binariesDirectory: string | null;
	forceIPv4: boolean;
	askAIEnabled: boolean;
	forceNew: boolean;
}): Promise<StartStudioResult> => {
	try {
		if (typeof Bun === 'undefined') {
			process.title = 'node (npx remotion studio)';
		} else if (typeof Deno === 'undefined') {
			process.title = 'deno (npx remotiond studio)';
		} else {
			process.title = `bun (bunx remotionb studio)`;
		}
	} catch {}

	watchRootFile(remotionRoot, previewEntry);
	const publicDir = getAbsolutePublicDir({
		relativePublicDir,
		remotionRoot,
	});
	const hash = crypto.randomBytes(6).toString('hex');

	const outputHashPrefix = '/outputs-';
	const outputHash = `${outputHashPrefix}${hash}`;

	const staticHashPrefix = '/static-';
	const staticHash = `${staticHashPrefix}${hash}`;

	initPublicFolderWatch({
		publicDir,
		remotionRoot,
		onUpdate: () => {
			waitForLiveEventsListener().then((listener) => {
				const files = getFiles();
				listener.sendEventToClient({
					type: 'new-public-folder',
					files,
					folderExists:
						files.length > 0
							? publicDir
							: existsSync(publicDir)
								? publicDir
								: null,
				});
			});
		},
		staticHash,
	});

	const result = await startServer({
		entry: path.resolve(previewEntry),
		userDefinedComponent: fullEntryPath,
		getCurrentInputProps,
		getEnvVariables,
		port: desiredPort,
		maxTimelineTracks,
		remotionRoot,
		keyboardShortcutsEnabled,
		experimentalClientSideRenderingEnabled,
		publicDir,
		webpackOverride,
		poll,
		staticHash,
		staticHashPrefix,
		outputHash,
		outputHashPrefix,
		logLevel,
		getRenderDefaults,
		getRenderQueue,
		numberOfAudioTags,
		queueMethods,
		gitSource,
		bufferStateDelayInMilliseconds,
		binariesDirectory,
		forceIPv4,
		audioLatencyHint,
		enableCrossSiteIsolation,
		askAIEnabled,
		forceNew,
	});

	if (result.type === 'already-running') {
		RenderInternals.Log.info(
			{indent: false, logLevel},
			`Remotion Studio already running on port ${result.port}. Opening browser...`,
		);
		await maybeOpenBrowser({
			browserArgs,
			browserFlag,
			configValueShouldOpenBrowser,
			parsedCliOpen,
			url: `http://localhost:${result.port}`,
			logLevel,
		});
		return {type: 'already-running'};
	}

	const {port, liveEventsServer, close} = result;

	const cleanupLiveEventsListener = setLiveEventsListener(liveEventsServer);
	const networkAddress = getNetworkAddress();
	if (networkAddress) {
		setServerReadyComment(
			`Local: ${RenderInternals.chalk.underline(
				`http://localhost:${port}`,
			)}, Network: ${RenderInternals.chalk.underline(
				`http://${networkAddress}:${port}`,
			)}`,
		);
	} else {
		setServerReadyComment(`http://localhost:${port}`);
	}

	printServerReadyComment('Server ready', logLevel);
	RenderInternals.Log.info({indent: false, logLevel}, 'Building...');

	await maybeOpenBrowser({
		browserArgs,
		browserFlag,
		configValueShouldOpenBrowser,
		parsedCliOpen,
		url: `http://localhost:${port}`,
		logLevel,
	});

	await noOpUntilRestart();
	RenderInternals.Log.info(
		{indent: false, logLevel},
		'Closing server to restart...',
	);

	await liveEventsServer.closeConnections();
	cleanupLiveEventsListener();
	await close();
	RenderInternals.Log.info(
		{indent: false, logLevel},
		RenderInternals.chalk.blue('Restarting server...'),
	);

	return {type: 'restarted'};
};
