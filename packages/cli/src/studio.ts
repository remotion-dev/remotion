import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {StudioServerInternals} from '@remotion/studio-server';
import {ConfigInternals} from './config';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {failOrThrow, type ExitBehavior} from './exit-behavior';
import {getEnvironmentVariables} from './get-env';
import {getGitSource} from './get-github-repository';
import {getInputProps} from './get-input-props';
import {getRenderDefaults} from './get-render-defaults';
import {Log} from './log';
import type {ParsedCommandLine} from './parsed-cli';
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
	experimentalClientSideRenderingOption,
	experimentalVisualModeOption,
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
} = BrowserSafeApis.options;

export const studioCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
	{
		commandLine = parsedCli,
		exitBehavior = 'process-exit',
	}: {commandLine?: ParsedCommandLine; exitBehavior?: ExitBehavior} = {},
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
		return failOrThrow({
			behavior: exitBehavior,
			code: 1,
			error: new Error(
				'No Remotion entrypoint was found. Specify one manually, for example: npx remotion studio src/index.ts',
			),
		});
	}

	const desiredPort =
		portOption.getValue({commandLine}).value ??
		ConfigInternals.getStudioPort() ??
		null;

	const fullEntryPath = convertEntryPointToServeUrl(file);

	let inputProps = getInputProps(
		(newProps) => {
			StudioServerInternals.waitForLiveEventsListener().then((listener) => {
				inputProps = newProps;
				listener.sendEventToClient({
					type: 'new-input-props',
					newProps,
				});
			});
		},
		logLevel,
		commandLine,
		exitBehavior,
	);
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
		{commandLine, exitBehavior},
	);

	const keyboardShortcutsEnabled = keyboardShortcutsOption.getValue({
		commandLine,
	}).value;

	const experimentalClientSideRenderingEnabled =
		experimentalClientSideRenderingOption.getValue({
			commandLine,
		}).value;

	if (experimentalClientSideRenderingEnabled) {
		Log.warn(
			{indent: false, logLevel},
			'Enabling WIP client-side rendering. Please see caveats on https://www.remotion.dev/docs/client-side-rendering/.',
		);
	}

	const binariesDirectory = binariesDirectoryOption.getValue({
		commandLine,
	}).value;

	const disableGitSource = disableGitSourceOption.getValue({
		commandLine,
	}).value;

	const relativePublicDir = publicDirOption.getValue({
		commandLine,
	}).value;

	const enableCrossSiteIsolation = enableCrossSiteIsolationOption.getValue({
		commandLine,
	}).value;

	const askAIEnabled = askAIOption.getValue({
		commandLine,
	}).value;

	const gitSource = getGitSource({remotionRoot, disableGitSource, logLevel});

	const useRspack = rspackOption.getValue({commandLine}).value;

	if (useRspack) {
		Log.warn(
			{indent: false, logLevel},
			'Enabling experimental Rspack bundler.',
		);
	}

	const useVisualMode = experimentalVisualModeOption.getValue({
		commandLine,
	}).value;

	if (useVisualMode) {
		Log.warn({indent: false, logLevel}, 'Enabling experimental visual mode.');
	}

	const result = await StudioServerInternals.startStudio({
		previewEntry: require.resolve('@remotion/studio/previewEntry'),
		browserArgs: commandLine['browser-args'],
		browserFlag: browserOption.getValue({commandLine}).value ?? '',
		logLevel,
		shouldOpenBrowser: !noOpenOption.getValue({commandLine}).value,
		fullEntryPath,
		getCurrentInputProps: () => inputProps,
		getEnvVariables: () => envVariables,
		desiredPort,
		keyboardShortcutsEnabled,
		experimentalClientSideRenderingEnabled,
		experimentalVisualModeEnabled: useVisualMode,
		maxTimelineTracks: ConfigInternals.getMaxTimelineTracks(),
		remotionRoot,
		relativePublicDir,
		webpackOverride: ConfigInternals.getWebpackOverrideFn(),
		poll: webpackPollOption.getValue({commandLine}).value,
		getRenderDefaults: () => getRenderDefaults(commandLine),
		getRenderQueue,
		numberOfAudioTags: numberOfSharedAudioTagsOption.getValue({
			commandLine,
		}).value,
		queueMethods: {
			addJob,
			cancelJob,
			removeJob,
		},
		gitSource,
		bufferStateDelayInMilliseconds:
			ConfigInternals.getBufferStateDelayInMilliseconds(),
		binariesDirectory,
		forceIPv4: ipv4Option.getValue({commandLine}).value,
		audioLatencyHint: audioLatencyHintOption.getValue({
			commandLine,
		}).value,
		enableCrossSiteIsolation,
		askAIEnabled,
		forceNew: forceNewStudioOption.getValue({commandLine}).value,
		rspack: useRspack,
	});

	if (result.type === 'already-running') {
		return;
	}

	// If the server is restarted through the UI, let's do the whole thing again.
	await studioCommand(remotionRoot, args, logLevel, {
		commandLine,
		exitBehavior,
	});
};
