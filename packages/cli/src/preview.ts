import betterOpn from 'better-opn';
import path from 'path';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {getNetworkAddress} from './get-network-address';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {
	setLiveEventsListener,
	waitForLiveEventsListener,
} from './preview-server/live-events';
import {startServer} from './preview-server/start-server';

const noop = () => undefined;

const getShouldOpenBrowser = (): {
	shouldOpenBrowser: boolean;
	reasonForBrowserDecision: string;
} => {
	if (parsedCli['no-open']) {
		return {
			shouldOpenBrowser: false,
			reasonForBrowserDecision: '--no-open specified',
		};
	}

	if (process.env.BROWSER === 'none') {
		return {
			shouldOpenBrowser: false,
			reasonForBrowserDecision: 'env BROWSER=none was set',
		};
	}

	if (ConfigInternals.getShouldOpenBrowser() === false) {
		return {shouldOpenBrowser: false, reasonForBrowserDecision: 'Config file'};
	}

	return {shouldOpenBrowser: true, reasonForBrowserDecision: 'default'};
};

export const previewCommand = async (remotionRoot: string, args: string[]) => {
	const {file, reason} = findEntryPoint(args, remotionRoot);

	Log.verbose('Entry point:', file, 'reason:', reason);

	if (!file) {
		Log.error(
			'The preview command requires you to specify a root file. For example'
		);
		Log.error('  npx remotion preview src/index.ts');
		Log.error(
			'See https://www.remotion.dev/docs/register-root for more information.'
		);
		process.exit(1);
	}

	const {port: desiredPort} = parsedCli;

	const fullPath = convertEntryPointToServeUrl(file);

	let inputProps = getInputProps((newProps) => {
		waitForLiveEventsListener().then((listener) => {
			inputProps = newProps;
			listener.sendEventToClient({
				type: 'new-input-props',
				newProps,
			});
		});
	});
	let envVariables = await getEnvironmentVariables((newEnvVariables) => {
		waitForLiveEventsListener().then((listener) => {
			envVariables = newEnvVariables;
			listener.sendEventToClient({
				type: 'new-env-variables',
				newEnvVariables,
			});
		});
	});

	const {port, liveEventsServer} = await startServer(
		path.resolve(__dirname, 'previewEntry.js'),
		fullPath,
		{
			getCurrentInputProps: () => inputProps,
			getEnvVariables: () => envVariables,
			port: desiredPort,
			maxTimelineTracks: ConfigInternals.getMaxTimelineTracks(),
			remotionRoot,
			keyboardShortcutsEnabled: ConfigInternals.getKeyboardShortcutsEnabled(),
			userPassedPublicDir: ConfigInternals.getPublicDir(),
			webpackOverride: ConfigInternals.getWebpackOverrideFn(),
			poll: ConfigInternals.getWebpackPolling(),
		}
	);

	setLiveEventsListener(liveEventsServer);
	const networkAddress = getNetworkAddress();
	if (networkAddress) {
		Log.info(
			`Server ready - Local: ${chalk.underline(
				`http://localhost:${port}`
			)}, Network: ${chalk.underline(`http://${networkAddress}:${port}`)}`
		);
	} else {
		Log.info(`Running on http://localhost:${port}`);
	}

	const {reasonForBrowserDecision, shouldOpenBrowser} = getShouldOpenBrowser();

	if (shouldOpenBrowser) {
		betterOpn(`http://localhost:${port}`);
	} else {
		Log.verbose(`Not opening browser, reason: ${reasonForBrowserDecision}`);
	}

	await new Promise(noop);
};
