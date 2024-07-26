import type {ProviderSpecifics} from '@remotion/serverless';
import {bucketExistsInRegionImplementation} from '../api/bucket-exists';
import {createBucket} from '../api/create-bucket';
import {getRemotionBuckets} from '../api/get-buckets';
import {lambdaDeleteFileImplementation} from '../io/delete-file';
import {lambdaLsImplementation} from '../io/list-objects';
import type {AwsRegion} from '../regions';
import {applyLifeCyleOperation} from '../shared/lifecycle-rules';
import {randomHashImplementation} from '../shared/random-hash';
import {getCurrentRegionInFunctionImplementation} from './helpers/get-current-region';

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
	getCurrentRegionInFunction: getCurrentRegionInFunctionImplementation,
	regionType: 'us-east-1',
	getBuckets: getRemotionBuckets,
	createBucket,
	applyLifeCycle: applyLifeCyleOperation,
	listObjects: lambdaLsImplementation,
	deleteFile: lambdaDeleteFileImplementation,
	bucketExists: bucketExistsInRegionImplementation,
	randomHash: randomHashImplementation,
};
