import type {AwsRegion} from './regions';

export type AwsProvider = {
	type: 'aws';
	region: AwsRegion;
	receivedArtifactType: {
		s3Key: string;
		s3Url: string;
	};
	creationFunctionOptions: {
		createCloudWatchLogGroup: boolean;
		accountId: string;
		alreadyCreated: boolean;
		retentionInDays: number;
		customRoleArn: string;
		enableLambdaInsights: boolean;
		vpcSubnetIds: string;
		vpcSecurityGroupIds: string;
		runtimePreference: RuntimePreference;
	};
};

import type {ProviderSpecifics} from '@remotion/serverless-client';
import {expiryDays} from '@remotion/serverless-client';
import {EventEmitter} from 'node:events';
import {bucketExistsInRegionImplementation} from './bucket-exists';
import {callFunctionAsyncImplementation} from './call-lambda-async';
import {callFunctionWithStreamingImplementation} from './call-lambda-streaming';
import {callFunctionSyncImplementation} from './call-lambda-sync';
import {checkCredentials} from './check-credentials';
import {MAX_EPHEMERAL_STORAGE_IN_MB, REMOTION_BUCKET_PREFIX} from './constants';
import {convertToServeUrlImplementation} from './convert-to-serve-url';
import {createBucket} from './create-bucket';
import {lambdaDeleteFileImplementation} from './delete-file';
import {deleteFunction} from './delete-function';
import {estimatePrice} from './estimate-price';
import {getAccountIdImplementation} from './get-account-id';
import {getCloudwatchMethodUrl, getCloudwatchRendererUrl} from './get-aws-urls';
import {getRemotionBuckets} from './get-buckets';
import {getFunctions} from './get-functions';
import {getOutputUrlFromMetadata} from './get-output-url-from-metadata';
import {lambdaHeadFileImplementation} from './head-file';
import {isFlakyError} from './is-flaky-error';
import {applyLifeCyleOperation} from './lifecycle-rules';
import {lambdaLsImplementation} from './list-objects';
import {parseFunctionName} from './parse-function-name';
import {randomHashImplementation} from './random-hash';
import {lambdaReadFileImplementation} from './read-file';
import type {RuntimePreference} from './runtime-preference';
import {lambdaWriteFileImplementation} from './write-file';

if (
	/^AWS_Lambda_nodejs(?:18|20)[.]x$/.test(
		process.env.AWS_EXECUTION_ENV ?? '',
	) === true
) {
	process.env.FONTCONFIG_PATH = '/opt';
	process.env.FONTCONFIG_FILE = '/opt/fonts.conf';

	process.env.DISABLE_FROM_SURFACE = '1';
	process.env.NO_COLOR = '1';

	// @ts-expect-error
	globalThis._dumpUnreleasedBuffers = new EventEmitter();

	// @ts-expect-error
	(globalThis._dumpUnreleasedBuffers as EventEmitter).setMaxListeners(201);
}

const validateDeleteAfter = (lifeCycleValue: unknown) => {
	if (lifeCycleValue === null) {
		return;
	}

	if (lifeCycleValue === undefined) {
		return;
	}

	if (typeof lifeCycleValue !== 'string') {
		throw new TypeError(
			`Expected life cycle value to be a string, got ${JSON.stringify(
				lifeCycleValue,
			)}`,
		);
	}

	if (!(lifeCycleValue in expiryDays)) {
		throw new TypeError(
			`Expected deleteAfter value to be one of ${Object.keys(expiryDays).join(
				', ',
			)}, got ${lifeCycleValue}`,
		);
	}
};

export const awsImplementation: ProviderSpecifics<AwsProvider> = {
	getChromiumPath() {
		return '/opt/bin/chromium';
	},
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
	validateDeleteAfter,
	callFunctionAsync: callFunctionAsyncImplementation,
	callFunctionStreaming: callFunctionWithStreamingImplementation,
	callFunctionSync: callFunctionSyncImplementation,
	getEphemeralStorageForPriceCalculation() {
		// We cannot determine the ephemeral storage size, so we
		// overestimate the price, but will only have a miniscule effect (~0.2%)
		return MAX_EPHEMERAL_STORAGE_IN_MB;
	},
	estimatePrice,
	getLoggingUrlForMethod: getCloudwatchMethodUrl,
	getLoggingUrlForRendererFunction: getCloudwatchRendererUrl,
	isFlakyError,
	getOutputUrl: getOutputUrlFromMetadata,
	serverStorageProductName: () => 'S3',
	getMaxStillInlinePayloadSize: () => 5_000_000,
	getMaxNonInlinePayloadSizePerFunction: () => 200_000,
	getAccountId: getAccountIdImplementation,
	deleteFunction,
	getFunctions,
	parseFunctionName,
	checkCredentials,
	getBucketPrefix: () => REMOTION_BUCKET_PREFIX,
};
