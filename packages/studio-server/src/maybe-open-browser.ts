import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {openBrowser} from './better-opn';

const getShouldOpenBrowser = ({
	configValueShouldOpenBrowser,
	parsedCliOpen,
}: {
	configValueShouldOpenBrowser: boolean;
	parsedCliOpen: boolean;
}): {
	shouldOpenBrowser: boolean;
	reasonForBrowserDecision: string;
} => {
	if (parsedCliOpen === false) {
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

	if (configValueShouldOpenBrowser === false) {
		return {shouldOpenBrowser: false, reasonForBrowserDecision: 'Config file'};
	}

	return {shouldOpenBrowser: true, reasonForBrowserDecision: 'default'};
};

export const maybeOpenBrowser = async ({
	browserArgs,
	browserFlag,
	configValueShouldOpenBrowser,
	parsedCliOpen,
	url,
	logLevel,
}: {
	browserArgs: string;
	browserFlag: string;
	configValueShouldOpenBrowser: boolean;
	parsedCliOpen: boolean;
	url: string;
	logLevel: LogLevel;
}) => {
	const {reasonForBrowserDecision, shouldOpenBrowser} = getShouldOpenBrowser({
		configValueShouldOpenBrowser,
		parsedCliOpen,
	});

	if (shouldOpenBrowser) {
		await openBrowser({
			url,
			browserArgs,
			browserFlag,
		});
	} else {
		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			`Not opening browser, reason: ${reasonForBrowserDecision}`,
		);
	}
};
