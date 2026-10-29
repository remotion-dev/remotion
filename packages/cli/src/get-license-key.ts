import {BrowserSafeApis} from '@remotion/renderer/client';
import {parsedCli} from './parsed-cli';

export const getLicenseKey = (): string | null => {
	const {value} = BrowserSafeApis.options.licenseKeyOption.getValue({
		commandLine: parsedCli,
	});
	if (
		value !== null &&
		(typeof value !== 'string' || !value.startsWith('rm_sec_'))
	) {
		throw new Error(
			'Invalid --license-key. Pass a private API key starting with "rm_sec_" from https://www.remotion.pro/dashboard.',
		);
	}

	return value;
};
