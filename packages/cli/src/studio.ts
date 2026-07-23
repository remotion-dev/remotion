import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {StudioServerInternals} from '@remotion/studio-server';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {getLoadedConfigFile, reloadConfig} from './get-config-file-name';
import {getEnvironmentVariables} from './get-env';
import {getGitSource} from './get-github-repository';
import {getInputProps} from './get-input-props';
import {getRenderDefaults} from './get-render-defaults';
import {Log} from './log';
import {parsedCli} from './parsed-cli';
import {
	addJob,
	cancelJob,
	getRenderQueue,
	removeJob,
} from './render-queue/queue';

const {
	binariesDirectoryOption,
	publicDirOption,
	disableGitSourceOption,
	enableCrossSiteIsolationOption,
	askAIOption,
	interactivityOption,
	keyboardShortcutsOption,
	forceNewStudioOption,
	numberOfSharedAudioTagsOption,
	audioLatencyHintOption,
	ipv4Option,
	rspackOption,
	webpackPollOption,
	noOpenOption,
	portOption,
	browserOption,
	previewSampleRateOption,
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

	const desiredPort =
		portOption.getValue({commandLine: parsedCli}).value ??
		ConfigInternals.getStudioPort() ??
		null;

	const fullEntryPath = convertEntryPointToServeUrl(file);

	StudioServerInternals.setFileWatcherRegistry(
		StudioServerInternals.createFileWatcherRegistry(),
	);

	const configFile = getLoadedConfigFile();
	if (configFile) {
		let isReloadingConfig = false;
		StudioServerInternals.installFileWatcher({
			file: configFile,
			existenceOnly: false,
			onChange: async () => {
				if (isReloadingConfig) {
					return;
				}

				isReloadingConfig = true;
				try {
					const configWasReloaded = await reloadConfig({
						resetConfigOptions: ConfigInternals.resetConfigOptions,
					});
					if (!configWasReloaded) {
						return;
					}

					Log.info(
						{indent: false, logLevel},
						chalk.blue('Config file changed. Reloading Studio'),
					);
					StudioServerInternals.waitForLiveEventsListener().then((listener) => {
						listener.sendEventToClient({
							type: 'config-file-changed',
						});
					});
				} finally {
					isReloadingConfig = false;
				}
			},
		});
	}

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

	const binariesDirectory = binariesDirectoryOption.getValue({
		commandLine: parsedCli,
	}).value;

	const disableGitSource = disableGitSourceOption.getValue({
		commandLine: parsedCli,
	}).value;

	const relativePublicDir = publicDirOption.getValue({
		commandLine: parsedCli,
	}).value;
	const rendererPort = ConfigInternals.getRendererPortFromConfigFile();

	const enableCrossSiteIsolation = enableCrossSiteIsolationOption.getValue({
		commandLine: parsedCli,
	}).value;

	const askAIEnabled = askAIOption.getValue({
		commandLine: parsedCli,
	}).value;
	const interactivityEnabled = interactivityOption.getValue({
		commandLine: parsedCli,
	}).value;

	const gitSource = getGitSource({remotionRoot, disableGitSource, logLevel});

	const useRspack = rspackOption.getValue({commandLine: parsedCli}).value;
	const bundlerOverride = ConfigInternals.getBundlerOverrideFn();
	const rspackOverride = ConfigInternals.getRspackOverrideFn();
	const webpackOverride = ConfigInternals.getWebpackOverrideFn();

	if (useRspack) {
		Log.warn(
			{indent: false, logLevel},
			'Enabling experimental Rspack bundler.',
		);
	}

	const getStudioRuntimeConfig = () => ({
		maxTimelineTracks: ConfigInternals.getMaxTimelineTracks(),
		askAIEnabled: askAIOption.getValue({
			commandLine: parsedCli,
		}).value,
		interactivityEnabled: interactivityOption.getValue({
			commandLine: parsedCli,
		}).value,
		keyboardShortcutsEnabled: keyboardShortcutsOption.getValue({
			commandLine: parsedCli,
		}).value,
		bufferStateDelayInMilliseconds:
			ConfigInternals.getBufferStateDelayInMilliseconds(),
	});
	const getNumberOfAudioTags = () =>
		numberOfSharedAudioTagsOption.getValue({commandLine: parsedCli}).value;
	const getAudioLatencyHint = () =>
		audioLatencyHintOption.getValue({commandLine: parsedCli}).value;
	const getPreviewSampleRate = () =>
		previewSampleRateOption.getValue({commandLine: parsedCli}).value;

	const result = await StudioServerInternals.startStudio({
		previewEntry: require.resolve('@remotion/studio/previewEntry'),
		browserArgs: parsedCli['browser-args'],
		browserFlag: browserOption.getValue({commandLine: parsedCli}).value ?? '',
		logLevel,
		shouldOpenBrowser: !noOpenOption.getValue({commandLine: parsedCli}).value,
		fullEntryPath,
		getCurrentInputProps: () => inputProps,
		getEnvVariables: () => envVariables,
		desiredPort,
		keyboardShortcutsEnabled,
		maxTimelineTracks: ConfigInternals.getMaxTimelineTracks(),
		remotionRoot,
		relativePublicDir,
		bundlerOverride,
		rspackOverride,
		webpackOverride,
		poll: webpackPollOption.getValue({commandLine: parsedCli}).value,
		getRenderDefaults: () => getRenderDefaults(logLevel),
		getRenderQueue,
		getNumberOfAudioTags,
		queueMethods: {
			addJob: (options) =>
				addJob({
					...options,
					fixedConfig: {
						bundlerOverride,
						publicDir: relativePublicDir,
						rendererPort,
						rspackOverride,
						rspack: useRspack,
						webpackOverride,
					},
				}),
			cancelJob,
			removeJob,
		},
		gitSource,
		bufferStateDelayInMilliseconds:
			ConfigInternals.getBufferStateDelayInMilliseconds(),
		binariesDirectory,
		forceIPv4: ipv4Option.getValue({commandLine: parsedCli}).value,
		getAudioLatencyHint,
		getPreviewSampleRate,
		enableCrossSiteIsolation,
		askAIEnabled,
		interactivityEnabled,
		forceNew: forceNewStudioOption.getValue({commandLine: parsedCli}).value,
		rspack: useRspack,
		getStudioRuntimeConfig,
	});

	if (result.type === 'already-running') {
		return;
	}

	// If the server is restarted through the UI, let's do the whole thing again.
	await studioCommand(remotionRoot, args, logLevel);
};
