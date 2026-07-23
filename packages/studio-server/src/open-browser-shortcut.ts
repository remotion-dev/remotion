import * as readline from 'node:readline';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {focusBrowserTabByOrigin} from './better-opn';
import {maybeOpenBrowser} from './maybe-open-browser';
import {clearPrintPortMessageTimeout} from './preview-server/live-events';

type Key = {
	name?: string;
	ctrl?: boolean;
	meta?: boolean;
};

export const registerOpenBrowserShortcut = ({
	browserArgs,
	browserFlag,
	url,
	logLevel,
}: {
	browserArgs: string;
	browserFlag: string;
	url: string;
	logLevel: LogLevel;
}): {registered: boolean; cleanup: () => void} => {
	if (!process.stdin.isTTY) {
		return {registered: false, cleanup: () => undefined};
	}

	if (typeof process.stdin.setRawMode !== 'function') {
		return {registered: false, cleanup: () => undefined};
	}

	const wasRaw = process.stdin.isRaw;
	const shouldPauseAfterCleanup = process.stdin.isPaused();
	let cleanedUp = false;
	let isOpeningBrowser = false;

	const cleanup = () => {
		if (cleanedUp) {
			return;
		}

		cleanedUp = true;
		process.stdin.removeListener('keypress', onKeypress);
		process.removeListener('SIGINT', cleanup);
		process.removeListener('exit', cleanup);

		if (!wasRaw && process.stdin.isTTY) {
			process.stdin.setRawMode(false);
		}

		if (shouldPauseAfterCleanup) {
			process.stdin.pause();
		}
	};

	const openStudio = async () => {
		if (isOpeningBrowser) {
			return;
		}

		isOpeningBrowser = true;
		clearPrintPortMessageTimeout();
		try {
			const didFocus = await focusBrowserTabByOrigin({
				url,
				browserArgs,
				browserFlag,
			});
			if (didFocus) {
				RenderInternals.Log.info(
					{indent: false, logLevel},
					RenderInternals.chalk.blue(`Opened ${url} in browser`),
				);
				return;
			}

			const result = await maybeOpenBrowser({
				browserArgs,
				browserFlag,
				shouldOpenBrowser: true,
				url,
				logLevel,
			});
			if (result.didOpenBrowser) {
				RenderInternals.Log.info(
					{indent: false, logLevel},
					RenderInternals.chalk.blue(`Opened ${url} in browser`),
				);
			}
		} catch (err) {
			RenderInternals.Log.error(
				{indent: false, logLevel},
				'Could not open browser:',
				err,
			);
		} finally {
			isOpeningBrowser = false;
		}
	};

	function onKeypress(_str: string, key: Key | undefined) {
		if (key?.ctrl && key.name === 'c') {
			cleanup();
			process.kill(process.pid, 'SIGINT');
			return;
		}

		if (key?.meta || key?.ctrl || key?.name !== 's') {
			return;
		}

		openStudio().catch(() => undefined);
	}

	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.on('keypress', onKeypress);
	process.once('SIGINT', cleanup);
	process.once('exit', cleanup);

	return {registered: true, cleanup};
};
