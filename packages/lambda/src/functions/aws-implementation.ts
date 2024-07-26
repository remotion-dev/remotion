import type {ProviderSpecifics} from '@remotion/serverless';
import type {AwsRegion} from '../regions';
import {getCurrentRegionInFunction} from './helpers/get-current-region';

if (
	/^AWS_Lambda_nodejs(?:18|20)[.]x$/.test(
		process.env.AWS_EXECUTION_ENV ?? '',
	) === true
) {
	process.env.FONTCONFIG_PATH = '/opt';
	process.env.FONTCONFIG_FILE = '/opt/fonts.conf';

	process.env.DISABLE_FROM_SURFACE = '1';
	process.env.NO_COLOR = '1';
}

export const awsImplementation: ProviderSpecifics<AwsRegion> = {
	getChromiumPath() {
		return '/opt/bin/chromium';
	},
	getCurrentRegionInFunction,
	regionType: 'us-east-1',
};
