import crypto from 'crypto';
import path from 'path';
import {betterOpn} from './better-opn';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {findEntryPoint} from './entry-point';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {getNetworkAddress} from './get-network-address';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {getAbsolutePublicDir} from './preview-server/get-absolute-public-dir';
import type {LiveEventsServer} from './preview-server/live-events';
import {getFiles, initPublicFolderWatch} from './preview-server/public-folder';
import {startServer} from './preview-server/start-server';

const noop = () => undefined;
type Waiter = (list: LiveEventsServer) => void;

let liveEventsListener: LiveEventsServer | null = null;
const waiters: Waiter[] = [];

const setLiveEventsListener = (listener: LiveEventsServer) => {
	liveEventsListener = listener;
	waiters.forEach((w) => w(listener));
};

const waitForLiveEventsListener = (): Promise<LiveEventsServer> => {
	if (liveEventsListener) {
		return Promise.resolve(liveEventsListener);
	}

	return new Promise<LiveEventsServer>((resolve) => {
		waiters.push((list: LiveEventsServer) => {
			resolve(list);
		});
	});
};

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

	const desiredPort = getPort();

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

	const {port, liveEventsServer} = await startServer({
		entry: path.resolve(__dirname, 'previewEntry.js'),
		userDefinedComponent: file,
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
