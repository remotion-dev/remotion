import {BrowserSafeApis} from '@remotion/renderer/client';
import {Config} from './config';
import {parsedCli} from './parsed-cli';

const {licenseKeyOption} = BrowserSafeApis.options;

export const parseCommandLine = () => {
	if (parsedCli.png) {
		throw new Error(
			'The --png flag has been removed. Use --sequence --image-format=png from now on.',
		);
	}

	const {value: licenseKey, source} = licenseKeyOption.getValue({
		commandLine: parsedCli,
	});
	if (source === 'cli' && licenseKey?.startsWith('rm_pub_')) {
		Config.setPublicLicenseKey(licenseKey);
	}
};
