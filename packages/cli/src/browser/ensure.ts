import type {LogLevel} from '@remotion/renderer';
import {ensureBrowser} from '@remotion/renderer';
import {defaultBrowserDownloadProgress} from '../browser-download-bar';
import {getCliOptions} from '../get-cli-options';
import {Log} from '../log';
import {quietFlagProvided} from '../parsed-cli';

export const ENSURE_COMMAND = 'ensure';

export const ensureCommand = async (logLevel: LogLevel) => {
	const {browserExecutable} = getCliOptions({
		isStill: false,
		logLevel,
	});

	const indent = false;

	const status = await ensureBrowser({
		browserExecutable,
		logLevel,
		onBrowserDownload: defaultBrowserDownloadProgress({
			indent,
			logLevel,
			quiet: quietFlagProvided(),
		}),
	});

	if (status.type === 'no-browser') {
		throw new Error('should have downloaded browser');
	}

	if (status.type === 'user-defined-path') {
		Log.info({indent, logLevel}, `Has browser at ${status.path}`);
		return;
	}

	if (status.type === 'local-browser') {
		Log.info({indent, logLevel}, `Has browser at ${status.path}`);
		return;
	}

	if (status.type === 'local-puppeteer-browser') {
		Log.info({indent, logLevel}, `Has browser at ${status.path}`);
	}
};
