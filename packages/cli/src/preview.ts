import betterOpn from 'better-opn';
import path from 'path';
import {chalk} from './chalk';
import {ConfigInternals} from './config';
import {findEntryPoint} from './entry-point';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {getNetworkAddress} from './get-network-address';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import type {LiveEventsServer} from './preview-server/live-events';
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

export const previewCommand = async (remotionRoot: string, args: string[]) => {
	const {file, reason} = findEntryPoint(args, remotionRoot);

	Log.verbose('Entry point:', file, 'reason:', reason);

	if (!file) {
		Log.error(
			'The preview command requires you to specify a root file. For example'
		);
		Log.error('  npx remotion preview src/index.tsx');
		Log.error(
			'See https://www.remotion.dev/docs/register-root for more information.'
		);
		process.exit(1);
	}

	const {port: desiredPort} = parsedCli;
	const fullPath = path.join(process.cwd(), file);

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

	betterOpn(`http://localhost:${port}`);
	await new Promise(noop);
};
