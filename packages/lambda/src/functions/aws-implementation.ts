import {type ProviderSpecifics} from '@remotion/serverless';
import {expiryDays} from '@remotion/serverless/client';
import {EventEmitter} from 'node:events';
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
};
