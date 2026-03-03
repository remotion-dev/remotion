import {Config} from './config';
import type {ParsedCommandLine} from './parsed-cli';
import {parsedCli} from './parsed-cli';

export const parseCommandLine = (
	commandLine: ParsedCommandLine = parsedCli,
) => {
	if (commandLine.png) {
		throw new Error(
			'The --png flag has been removed. Use --sequence --image-format=png from now on.',
		);
	}

	if (
		commandLine['license-key'] &&
		commandLine['license-key'].startsWith('rm_pub_')
	) {
		Config.setPublicLicenseKey(commandLine['license-key']);
	}
};
