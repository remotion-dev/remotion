import crypto from 'node:crypto';
import path from 'node:path';
import {openBrowser} from './better-opn';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {getNetworkAddress} from './get-network-address';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {getAbsolutePublicDir} from './preview-server/get-absolute-public-dir';
import {
	setLiveEventsListener,
	waitForLiveEventsListener,
} from './preview-server/live-events';
import {getFiles, initPublicFolderWatch} from './preview-server/public-folder';
import {startServer} from './preview-server/start-server';
import {
	printServerReadyComment,
	setServerReadyComment,
} from './server-ready-comment';
import {watchRootFile} from './watch-root-file';

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

	if ((process.env.BROWSER ?? '').toLowerCase() === 'none') {
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

const getPort = () => {
	if (parsedCli.port) {
		return parsedCli.port;
	}

	const serverPort = ConfigInternals.getServerPort();
	if (serverPort) {
		return serverPort;
	}

	return null;
};

export const studioCommand = async (remotionRoot: string, args: string[]) => {
	const {file, reason} = findEntryPoint(args, remotionRoot);

	Log.verbose('Entry point:', file, 'reason:', reason);

	if (!file) {
		Log.error(
			'No Remotion entrypoint was found. Specify an additional argument manually:'
		);
		Log.error('  npx remotion studio src/index.ts');
		Log.error(
			'See https://www.remotion.dev/docs/register-root for more information.'
		);
		process.exit(1);
	}

	const desiredPort = getPort();

	const fullEntryPath = convertEntryPointToServeUrl(file);

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

	const publicDir = getAbsolutePublicDir({
		userPassedPublicDir: ConfigInternals.getPublicDir(),
		remotionRoot,
	});

	const hashPrefix = '/static-';
	const staticHash = `${hashPrefix}${crypto.randomBytes(6).toString('hex')}`;

	initPublicFolderWatch({
		publicDir,
		remotionRoot,
		onUpdate: () => {
			waitForLiveEventsListener().then((listener) => {
				listener.sendEventToClient({
					type: 'new-public-folder',
					files: getFiles(),
				});
			});
		},
		staticHash,
	});

	watchRootFile(remotionRoot);

	const {port, liveEventsServer} = await startServer({
		entry: path.resolve(__dirname, 'previewEntry.js'),
		userDefinedComponent: fullEntryPath,
		getCurrentInputProps: () => inputProps,
		getEnvVariables: () => envVariables,
		port: desiredPort,
		maxTimelineTracks: ConfigInternals.getMaxTimelineTracks(),
		remotionRoot,
		keyboardShortcutsEnabled: ConfigInternals.getKeyboardShortcutsEnabled(),
		publicDir,
		webpackOverride: ConfigInternals.getWebpackOverrideFn(),
		poll: ConfigInternals.getWebpackPolling(),
		userPassedPublicDir: ConfigInternals.getPublicDir(),
		hash: staticHash,
		hashPrefix,
	});

	setLiveEventsListener(liveEventsServer);
	const networkAddress = getNetworkAddress();
	if (networkAddress) {
		setServerReadyComment(
			`Local: ${chalk.underline(
				`http://localhost:${port}`
			)}, Network: ${chalk.underline(`http://${networkAddress}:${port}`)}`
		);
	} else {
		setServerReadyComment(`http://localhost:${port}`);
	}

	printServerReadyComment('Server ready');

	const {reasonForBrowserDecision, shouldOpenBrowser} = getShouldOpenBrowser();

	if (shouldOpenBrowser) {
		await openBrowser({
			url: `http://localhost:${port}`,
			browserArgs: parsedCli['browser-args'],
			browserFlag: parsedCli.browser,
		});
	} else {
		Log.verbose(`Not opening browser, reason: ${reasonForBrowserDecision}`);
	}

	await new Promise(noop);
};
