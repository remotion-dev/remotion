import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {StudioServerInternals} from '@remotion/studio-server';
import {ConfigInternals} from './config';
import {getNumberOfSharedAudioTags} from './config/number-of-shared-audio-tags';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {detectRemotionServer} from './detect-remotion-server';
import {findEntryPoint} from './entry-point';
import {getEnvironmentVariables} from './get-env';
import {getGitSource} from './get-github-repository';
import {getInputProps} from './get-input-props';
import {getRenderDefaults} from './get-render-defaults';
import {isPortOpen} from './is-port-open';
import {Log} from './log';
import {parsedCli} from './parsed-cli';
import {
	addJob,
	cancelJob,
	getRenderQueue,
	removeJob,
} from './render-queue/queue';

const getPort = () => {
	if (parsedCli.port) {
		return parsedCli.port;
	}

	const serverPort = ConfigInternals.getStudioPort();
	if (serverPort) {
		return serverPort;
	}

	return null;
};

const {
	binariesDirectoryOption,
	publicDirOption,
	disableGitSourceOption,
	enableCrossSiteIsolationOption,
	askAIOption,
	experimentalClientSideRenderingOption,
	keyboardShortcutsOption,
} = BrowserSafeApis.options;

export const studioCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	const {file, reason} = findEntryPoint({
		args,
		remotionRoot,
		logLevel,
		allowDirectory: false,
	});

	Log.verbose(
		{indent: false, logLevel},
		'Entry point:',
		file,
		'reason:',
		reason,
	);

	if (!file) {
		Log.error(
			{indent: false, logLevel},
			'No Remotion entrypoint was found. Specify an additional argument manually:',
		);
		Log.error({indent: false, logLevel}, '  npx remotion studio src/index.ts');
		Log.error(
			{indent: false, logLevel},
			'See https://www.remotion.dev/docs/register-root for more information.',
		);
		process.exit(1);
	}

	const desiredPort = getPort();

	const port = desiredPort ?? 3000;
	const isFree = await isPortOpen(port);

	if (!isFree && !parsedCli['force-new']) {
		const detection = await detectRemotionServer(port, remotionRoot);

		if (detection.type === 'match') {
			Log.info(
				{indent: false, logLevel},
				`Remotion Studio already running on port ${port}. Opening browser...`,
			);
			await StudioServerInternals.openBrowser({
				url: `http://localhost:${port}`,
				browserFlag: parsedCli.browser,
				browserArgs: parsedCli['browser-args'],
			});
			// On Windows, the browser process might be killed if we exit too quickly
			await new Promise((resolve) => {
				setTimeout(resolve, 2000);
			});
			return;
		}
	}

	const fullEntryPath = convertEntryPointToServeUrl(file);

	let inputProps = getInputProps((newProps) => {
		StudioServerInternals.waitForLiveEventsListener().then((listener) => {
			inputProps = newProps;
			listener.sendEventToClient({
				type: 'new-input-props',
				newProps,
			});
		});
	}, logLevel);
	let envVariables = getEnvironmentVariables(
		(newEnvVariables) => {
			StudioServerInternals.waitForLiveEventsListener().then((listener) => {
				envVariables = newEnvVariables;
				listener.sendEventToClient({
					type: 'new-env-variables',
					newEnvVariables,
				});
			});
		},
		logLevel,
		false,
	);

	const keyboardShortcutsEnabled = keyboardShortcutsOption.getValue({
		commandLine: parsedCli,
	}).value;

	const experimentalClientSideRenderingEnabled =
		experimentalClientSideRenderingOption.getValue({
			commandLine: parsedCli,
		}).value;

	if (experimentalClientSideRenderingEnabled) {
		Log.warn(
			{indent: false, logLevel},
			'Enabling WIP client-side rendering. Please see caveats on https://www.remotion.dev/docs/client-side-rendering/.',
		);
	}

	const binariesDirectory = binariesDirectoryOption.getValue({
		commandLine: parsedCli,
	}).value;

	const disableGitSource = disableGitSourceOption.getValue({
		commandLine: parsedCli,
	}).value;

	const relativePublicDir = publicDirOption.getValue({
		commandLine: parsedCli,
	}).value;

	const enableCrossSiteIsolation = enableCrossSiteIsolationOption.getValue({
		commandLine: parsedCli,
	}).value;

	const askAIEnabled = askAIOption.getValue({
		commandLine: parsedCli,
	}).value;

	const gitSource = getGitSource({remotionRoot, disableGitSource, logLevel});

	const lockfiles = StudioServerInternals.detectMultipleLockfiles(
		remotionRoot,
		0,
	);
	if (lockfiles.length > 1) {
		Log.warn({indent: false, logLevel}, '⚠️  Multiple lockfiles detected:');
		for (const lockfile of lockfiles) {
			Log.warn({indent: false, logLevel}, `  - ${lockfile}`);
		}
		Log.warn({indent: false, logLevel}, '');
		Log.warn(
			{indent: false, logLevel},
			'This can cause dependency inconsistencies.',
		);
		Log.warn(
			{indent: false, logLevel},
			'Remotion Studio will continue to run.',
		);
	}

	await StudioServerInternals.startStudio({
		previewEntry: require.resolve('@remotion/studio/previewEntry'),
		browserArgs: parsedCli['browser-args'],
		browserFlag: parsedCli.browser,
		logLevel,
		configValueShouldOpenBrowser: ConfigInternals.getShouldOpenBrowser(),
		fullEntryPath,
		getCurrentInputProps: () => inputProps,
		getEnvVariables: () => envVariables,
		desiredPort,
		keyboardShortcutsEnabled,
		experimentalClientSideRenderingEnabled,
		maxTimelineTracks: ConfigInternals.getMaxTimelineTracks(),
		remotionRoot,
		relativePublicDir,
		webpackOverride: ConfigInternals.getWebpackOverrideFn(),
		poll: ConfigInternals.getWebpackPolling(),
		getRenderDefaults,
		getRenderQueue,
		numberOfAudioTags:
			parsedCli['number-of-shared-audio-tags'] ?? getNumberOfSharedAudioTags(),
		queueMethods: {
			addJob,
			cancelJob,
			removeJob,
		},
		// Minimist quirk: Adding `--no-open` flag will result in {['no-open']: false, open: true}
		// @ts-expect-error
		parsedCliOpen: parsedCli.open,
		gitSource,
		bufferStateDelayInMilliseconds:
			ConfigInternals.getBufferStateDelayInMilliseconds(),
		binariesDirectory,
		forceIPv4: parsedCli.ipv4,
		audioLatencyHint: parsedCli['audio-latency-hint'],
		enableCrossSiteIsolation,
		askAIEnabled,
	});

	// If the server is restarted through the UI, let's do the whole thing again.
	await studioCommand(remotionRoot, args, logLevel);
};
