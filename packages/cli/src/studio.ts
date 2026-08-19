import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {StudioServerInternals} from '@remotion/studio-server';
import type {StudioRuntimeConfig} from '@remotion/studio-shared';
import {getConfigFileChangeMessage} from '@remotion/studio-shared';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {
	classifyConfigFileChange,
	makeConfigFileFingerprints,
	type ConfigFileFingerprints,
} from './config-file-change';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {
	getLoadedConfigFile,
	getLoadedConfigFileCode,
	reloadConfig,
} from './get-config-file-name';
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
	experimentalKeepAudioContextAliveOption,
	numberOfSharedAudioTagsOption,
	audioLatencyHintOption,
	ipv4Option,
	rspackOption,
	webpackPollOption,
	noOpenOption,
	portOption,
	browserOption,
	previewSampleRateOption,
	defaultCodingAgentOption,
	defaultEditorOption,
	publicLicenseKeyOption,
	beepOnFinishOption,
	logLevelOption,
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

	const binariesDirectory = binariesDirectoryOption.getValue({
		commandLine: parsedCli,
	}).value;

	const disableGitSource = disableGitSourceOption.getValue({
		commandLine: parsedCli,
	}).value;

	const relativePublicDir = publicDirOption.getValue({
		commandLine: parsedCli,
	}).value;
	const getRelativePublicDir = () => {
		return publicDirOption.getValue({
			commandLine: parsedCli,
		}).value;
	};

	const rendererPort = ConfigInternals.getRendererPortFromConfigFile();

	const enableCrossSiteIsolation = enableCrossSiteIsolationOption.getValue({
		commandLine: parsedCli,
	}).value;

	const gitSource = getGitSource({remotionRoot, disableGitSource, logLevel});

	const useRspack = rspackOption.getValue({commandLine: parsedCli}).value;
	const bundlerOverride = ConfigInternals.getBundlerOverrideFn();
	const rspackOverride = ConfigInternals.getRspackOverrideFn();
	const webpackOverride = ConfigInternals.getWebpackOverrideFn();

	Log.verbose(
		{indent: false, logLevel},
		`Using ${useRspack ? 'Rspack' : 'Webpack'} bundler.`,
	);

	const getStudioRuntimeConfig = (): StudioRuntimeConfig => {
		const configuredEditor = defaultEditorOption.getValue({
			commandLine: parsedCli,
		}).value;

		return {
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
			defaultCodingAgent: defaultCodingAgentOption.getValue({
				commandLine: parsedCli,
			}).value,
			defaultEditor:
				typeof configuredEditor === 'object' ? 'custom' : configuredEditor,
			publicLicenseKey: publicLicenseKeyOption.getValue({
				commandLine: parsedCli,
			}).value,
			configFileStudioSettings: {
				askAIEnabled: askAIOption.getConfigValue(),
				audioLatencyHint: audioLatencyHintOption.getConfigValue(),
				beepOnFinish: beepOnFinishOption.getConfigValue(),
				enableCrossSiteIsolation:
					enableCrossSiteIsolationOption.getConfigValue(),
				interactivityEnabled: interactivityOption.getConfigValue(),
				keyboardShortcutsEnabled: keyboardShortcutsOption.getConfigValue(),
				logLevel: logLevelOption.getConfigValue(),
				maxTimelineTracks:
					StudioServerInternals.getConfiguredMaxTimelineTracks(),
				numberOfSharedAudioTags: numberOfSharedAudioTagsOption.getConfigValue(),
				rspack: rspackOption.getConfigValue(),
			},
		};
	};

	const getNumberOfAudioTags = () =>
		numberOfSharedAudioTagsOption.getValue({commandLine: parsedCli}).value;
	const getAudioLatencyHint = () =>
		audioLatencyHintOption.getValue({commandLine: parsedCli}).value;
	const getExperimentalKeepAudioContextAlive = () =>
		experimentalKeepAudioContextAliveOption.getValue({
			commandLine: parsedCli,
		}).value;
	const getPreviewSampleRate = () =>
		previewSampleRateOption.getValue({commandLine: parsedCli}).value;
	const getDefaultCodingAgent = () =>
		defaultCodingAgentOption.getValue({commandLine: parsedCli}).value;
	const getDefaultEditor = () =>
		defaultEditorOption.getValue({commandLine: parsedCli}).value;

	const startupConfigCode = getLoadedConfigFileCode();
	if (configFile && startupConfigCode) {
		let isReloadingConfig = false;
		let startupConfigFingerprints: ConfigFileFingerprints | null = null;
		const sendConfigFileReloadError = (errorMessage: string) => {
			StudioServerInternals.waitForLiveEventsListener().then((listener) => {
				listener.sendEventToClient({
					type: 'config-file-reload-failed',
					errorMessage,
				});
			});
		};

		StudioServerInternals.installFileWatcher({
			file: configFile,
			existenceOnly: false,
			onChange: async (event) => {
				if (isReloadingConfig) {
					return;
				}

				isReloadingConfig = true;
				try {
					const reloadResult = await reloadConfig({
						resetConfigOptions: ConfigInternals.resetConfigOptions,
						getConfigSnapshot: async (currentConfigCode) => {
							startupConfigFingerprints ??=
								makeConfigFileFingerprints(startupConfigCode);
							const configFileChangeType = classifyConfigFileChange({
								currentCode: currentConfigCode,
								startupFingerprints: startupConfigFingerprints,
							});

							return {
								changeType: configFileChangeType,
								renderDefaults: getRenderDefaults(logLevel),
								studioRuntimeConfig: getStudioRuntimeConfig(),
								editorName: await StudioServerInternals.getEditorName({
									getDefaultEditor,
									logLevel,
								}),
							};
						},
					});
					if (reloadResult.type === 'no-config') {
						return;
					}

					if (reloadResult.type === 'error') {
						sendConfigFileReloadError(reloadResult.errorMessage);
						return;
					}

					const {changeType, renderDefaults, studioRuntimeConfig, editorName} =
						reloadResult.value;
					const message = getConfigFileChangeMessage(changeType);

					Log.info({indent: false, logLevel}, chalk.blue(message));
					StudioServerInternals.waitForLiveEventsListener().then((listener) => {
						listener.sendEventToClient({
							type: 'config-file-changed',
							changeType,
							originatorClientId:
								event.type === 'deleted'
									? null
									: (event.originatorClientId ?? null),
							renderDefaults,
							studioRuntimeConfig,
							editorName,
						});
					});
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : String(error);
					Log.error({indent: false, logLevel: 'error'}, errorMessage);
					sendConfigFileReloadError(errorMessage);
				} finally {
					isReloadingConfig = false;
				}
			},
		});
	}

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
		remotionRoot,
		getRelativePublicDir,
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
		binariesDirectory,
		forceIPv4: ipv4Option.getValue({commandLine: parsedCli}).value,
		getAudioLatencyHint,
		getExperimentalKeepAudioContextAlive,
		getPreviewSampleRate,
		getDefaultCodingAgent,
		getDefaultEditor,
		enableCrossSiteIsolation,
		forceNew: forceNewStudioOption.getValue({commandLine: parsedCli}).value,
		rspack: useRspack,
		getStudioRuntimeConfig,
		configFile,
	});

	if (result.type === 'already-running') {
		return;
	}

	// If the server is restarted through the UI, let's do the whole thing again.
	await studioCommand(remotionRoot, args, logLevel);
};
