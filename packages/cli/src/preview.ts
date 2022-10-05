import betterOpn from 'better-opn';
import path from 'path';
import {ConfigInternals} from './config';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {initializeRenderCli} from './initialize-render-cli';
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

export const previewCommand = async (remotionRoot: string) => {
	const file = parsedCli._[1];

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

	await initializeRenderCli(remotionRoot);

	let inputProps = getInputProps((newProps) => {
		waitForLiveEventsListener().then((listener) => {
			inputProps = newProps;
			listener.sendEventToClient({
				type: 'new-input-props',
				newProps,
			});
		});
	});
	const envVariables = await getEnvironmentVariables();

	const {port, liveEventsServer} = await startServer(
		path.resolve(__dirname, 'previewEntry.js'),
		fullPath,
		{
			getCurrentInputProps: () => inputProps,
			envVariables,
			port: desiredPort,
			maxTimelineTracks: ConfigInternals.getMaxTimelineTracks(),
			remotionRoot,
			keyboardShortcutsEnabled: ConfigInternals.getKeyboardShortcutsEnabled(),
			userPassedPublicDir: ConfigInternals.getPublicDir(),
			webpackOverride: ConfigInternals.getWebpackOverrideFn(),
		}
	);

	setLiveEventsListener(liveEventsServer);
	Log.info(`Server running on http://localhost:${port}`);
	betterOpn(`http://localhost:${port}`);
	await new Promise(noop);
};
