import {type ProviderSpecifics} from '@remotion/serverless';
import {bucketExistsInRegionImplementation} from '../api/bucket-exists';
import {createBucket} from '../api/create-bucket';
import {getRemotionBuckets} from '../api/get-buckets';
import {lambdaDeleteFileImplementation} from '../io/delete-file';
import {lambdaHeadFileImplementation} from '../io/head-file';
import {lambdaLsImplementation} from '../io/list-objects';
import {lambdaReadFileImplementation} from '../io/read-file';
import {lambdaWriteFileImplementation} from '../io/write-file';
import type {AwsRegion} from '../regions';
import {convertToServeUrlImplementation} from '../shared/convert-to-serve-url';
import {applyLifeCyleOperation} from '../shared/lifecycle-rules';
import {randomHashImplementation} from '../shared/random-hash';
import {getCurrentRegionInFunctionImplementation} from './helpers/get-current-region';
import {getFolderFiles} from './helpers/get-folder-files';

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
	readFile: lambdaReadFileImplementation,
	writeFile: lambdaWriteFileImplementation,
	headFile: lambdaHeadFileImplementation,
	convertToServeUrl: convertToServeUrlImplementation,
	printLoggingHelper: true,
	getFolderFiles,
};
