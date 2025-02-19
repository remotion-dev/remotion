import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {StudioServerInternals} from '@remotion/studio-server';
import {ConfigInternals} from './config';
import {getNumberOfSharedAudioTags} from './config/number-of-shared-audio-tags';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
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

const {binariesDirectoryOption, publicDirOption, disableGitSourceOption} =
	BrowserSafeApis.options;

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

	const keyboardShortcutsEnabled =
		ConfigInternals.getKeyboardShortcutsEnabled();

	const binariesDirectory = binariesDirectoryOption.getValue({
		commandLine: parsedCli,
	}).value;

	const disableGitSource = disableGitSourceOption.getValue({
		commandLine: parsedCli,
	}).value;

	const relativePublicDir = publicDirOption.getValue({
		commandLine: parsedCli,
	}).value;

	const gitSource = getGitSource({remotionRoot, disableGitSource, logLevel});

	await StudioServerInternals.startStudio({
		previewEntry: require.resolve('@remotion/studio/entry'),
		browserArgs: parsedCli['browser-args'],
		browserFlag: parsedCli.browser,
		logLevel,
		configValueShouldOpenBrowser: ConfigInternals.getShouldOpenBrowser(),
		fullEntryPath,
		getCurrentInputProps: () => inputProps,
		getEnvVariables: () => envVariables,
		desiredPort,
		keyboardShortcutsEnabled,
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
	});

	// If the server is restarted through the UI, let's do the whole thing again.
	await studioCommand(remotionRoot, args, logLevel);
};
