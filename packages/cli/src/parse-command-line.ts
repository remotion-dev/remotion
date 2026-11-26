import {BrowserSafeApis} from '@remotion/renderer/client';
import {Config} from './config';
import {parsedCli} from './parsed-cli';

const {doubleClickActionOption, licenseKeyOption} = BrowserSafeApis.options;

export const parseCommandLine = () => {
	if (parsedCli['experimental-rspack'] !== undefined) {
		throw new Error(
			'The --experimental-rspack flag has been removed. Use --rspack from now on.',
		);
	}

	if (parsedCli.png) {
		throw new Error(
			'The --png flag has been removed. Use --sequence --image-format=png from now on.',
		);
	}

	if (parsedCli[doubleClickActionOption.cliFlag] !== undefined) {
		doubleClickActionOption.getValue({commandLine: parsedCli});
	}

	const {value: licenseKey, source} = licenseKeyOption.getValue({
		commandLine: parsedCli,
	});
	if (source === 'cli' && licenseKey?.startsWith('rm_pub_')) {
		Config.setPublicLicenseKey(licenseKey);
	}
};
