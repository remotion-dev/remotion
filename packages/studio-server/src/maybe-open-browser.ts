import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {openBrowser} from './better-opn';

export const maybeOpenBrowser = async ({
	browserArgs,
	browserFlag,
	shouldOpenBrowser,
	url,
	logLevel,
}: {
	browserArgs: string;
	browserFlag: string;
	shouldOpenBrowser: boolean;
	url: string;
	logLevel: LogLevel;
}) => {
	if ((process.env.BROWSER ?? '').toLowerCase() === 'none') {
		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			'Not opening browser, reason: env BROWSER=none was set',
		);
		return {didOpenBrowser: false};
	}

	if (shouldOpenBrowser) {
		await openBrowser({
			url,
			browserArgs,
			browserFlag,
		});
	} else {
		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			'Not opening browser, reason: --no-open specified or config file',
		);
	}

	return {didOpenBrowser: shouldOpenBrowser};
};
