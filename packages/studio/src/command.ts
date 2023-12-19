import type {LogLevel} from '@remotion/renderer';
import crypto from 'node:crypto';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {openBrowser} from '../../cli/src/better-opn';
import {chalk} from '../../cli/src/chalk';
import {ConfigInternals} from '../../cli/src/config';
import {convertEntryPointToServeUrl} from '../../cli/src/convert-entry-point-to-serve-url';
import {findEntryPoint} from '../../cli/src/entry-point';
import {getEnvironmentVariables} from '../../cli/src/get-env';
import {getInputProps} from '../../cli/src/get-input-props';
import {getNetworkAddress} from '../../cli/src/get-network-address';
import {Log} from '../../cli/src/log';
import {parsedCli} from '../../cli/src/parse-command-line';
import {getAbsolutePublicDir} from '../../cli/src/preview-server/get-absolute-public-dir';
import {
	setLiveEventsListener,
	waitForLiveEventsListener,
} from '../../cli/src/preview-server/live-events';
import {
	getFiles,
	initPublicFolderWatch,
} from '../../cli/src/preview-server/public-folder';
import {startServer} from '../../cli/src/preview-server/start-server';
import {
	printServerReadyComment,
	setServerReadyComment,
} from '../../cli/src/server-ready-comment';
import {watchRootFile} from './watch-root-file';

const noop = () => undefined;

const getShouldOpenBrowser = (): {
	shouldOpenBrowser: boolean;
	reasonForBrowserDecision: string;
} => {
	// Minimist quirk: Adding `--no-open` flag will result in {['no-open']: false, open: true}
	// @ts-expect-error
	if (parsedCli.open === false) {
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

	const serverPort = ConfigInternals.getStudioPort();
	if (serverPort) {
		return serverPort;
	}

	return null;
};

export const studioCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	const {file, reason} = findEntryPoint(args, remotionRoot, logLevel);

	Log.verbose(
		{indent: false, logLevel},
		'Entry point:',
		file,
		'reason:',
		reason,
	);

	if (!file) {
		Log.error(
			'No Remotion entrypoint was found. Specify an additional argument manually:',
		);
		Log.error('  npx remotion studio src/index.ts');
		Log.error(
			'See https://www.remotion.dev/docs/register-root for more information.',
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
	}, logLevel);
	let envVariables = getEnvironmentVariables((newEnvVariables) => {
		waitForLiveEventsListener().then((listener) => {
			envVariables = newEnvVariables;
			listener.sendEventToClient({
				type: 'new-env-variables',
				newEnvVariables,
			});
		});
	}, logLevel);

	const publicDir = getAbsolutePublicDir({
		userPassedPublicDir: ConfigInternals.getPublicDir(),
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
		staticHash,
		staticHashPrefix,
		outputHash,
		outputHashPrefix,
		logLevel,
	});

	setLiveEventsListener(liveEventsServer);
	const networkAddress = getNetworkAddress();
	if (networkAddress) {
		setServerReadyComment(
			`Local: ${chalk.underline(
				`http://localhost:${port}`,
			)}, Network: ${chalk.underline(`http://${networkAddress}:${port}`)}`,
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
		Log.verbose(
			{indent: false, logLevel},
			`Not opening browser, reason: ${reasonForBrowserDecision}`,
		);
	}

	await new Promise(noop);
};
