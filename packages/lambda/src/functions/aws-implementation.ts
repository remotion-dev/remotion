import type {ProviderSpecifics} from '@remotion/serverless';
import {expiryDays} from '@remotion/serverless/client';
import {EventEmitter} from 'node:events';
import {bucketExistsInRegionImplementation} from '../api/bucket-exists';
import {createBucket} from '../api/create-bucket';
import {deleteFunction} from '../api/delete-function';
import {estimatePrice} from '../api/estimate-price';
import {getRemotionBuckets} from '../api/get-buckets';
import {getFunctions} from '../api/get-functions';
import {MAX_EPHEMERAL_STORAGE_IN_MB} from '../defaults';
import {lambdaDeleteFileImplementation} from '../io/delete-file';
import {lambdaHeadFileImplementation} from '../io/head-file';
import {lambdaLsImplementation} from '../io/list-objects';
import {lambdaReadFileImplementation} from '../io/read-file';
import {lambdaWriteFileImplementation} from '../io/write-file';
import type {AwsRegion} from '../regions';
import {callFunctionAsyncImplementation} from '../shared/call-lambda-async';
import {callFunctionWithStreamingImplementation} from '../shared/call-lambda-streaming';
import {callFunctionSyncImplementation} from '../shared/call-lambda-sync';
import {convertToServeUrlImplementation} from '../shared/convert-to-serve-url';
import {getAccountIdImplementation} from '../shared/get-account-id';
import {
	getCloudwatchMethodUrl,
	getCloudwatchRendererUrl,
} from '../shared/get-aws-urls';
import type {RuntimePreference} from '../shared/get-layers';
import {isFlakyError} from '../shared/is-flaky-error';
import {applyLifeCyleOperation} from '../shared/lifecycle-rules';
import {randomHashImplementation} from '../shared/random-hash';
import {getCurrentRegionInFunctionImplementation} from './helpers/get-current-region';
import {getFolderFiles} from './helpers/get-folder-files';
import {getOutputUrlFromMetadata} from './helpers/get-output-url-from-metadata';
import {makeAwsArtifact} from './helpers/make-aws-artifact';

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
	getCurrentRegionInFunction: getCurrentRegionInFunctionImplementation,
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
	makeArtifactWithDetails: makeAwsArtifact,
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
};
