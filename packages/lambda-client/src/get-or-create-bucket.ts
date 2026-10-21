import type {LogLevel} from 'remotion';
import {getServiceDnsSuffix} from './aws-region-metadata';
import {checkBucketListing} from './check-bucket-listing';
import {REMOTION_BUCKET_PREFIX} from './constants';
import {createBucket} from './create-bucket';
import {getRemotionBuckets} from './get-buckets';
import {applyLifeCyleOperation} from './lifecycle-rules';
import {makeBucketName} from './make-bucket-name';
import type {AwsRegion} from './regions';
import type {CustomCredentials} from './shared-constants';
import type {RequestHandler} from './types';

type GetOrCreateBucketInputInner = {
	region: AwsRegion;
	enableFolderExpiry: boolean | null;
	customCredentials: CustomCredentials | null;
	forcePathStyle: boolean;
	skipPutAcl: boolean;
	logLevel: LogLevel;
	requestHandler: RequestHandler | null;
};

export type GetOrCreateBucketInput = {
	region: AwsRegion;
	enableFolderExpiry?: boolean;
	customCredentials?: CustomCredentials;
	forcePathStyle?: boolean;
	requestHandler?: RequestHandler;
	logLevel?: LogLevel;
};

export type GetOrCreateBucketOutput = {
	bucketName: string;
	alreadyExisted: boolean;
};

export const internalGetOrCreateBucket = async (
	params: GetOrCreateBucketInputInner,
): Promise<GetOrCreateBucketOutput> => {
	const remotionBuckets = await getRemotionBuckets({
		region: params.region,
		forceBucketName: null,
		forcePathStyle: params.forcePathStyle,
		requestHandler: params.requestHandler,
	});
	if (remotionBuckets.length > 1) {
		throw new Error(
			`You have multiple buckets (${remotionBuckets.map(
				(b) => b.name,
			)}) in your S3 region (${
				params.region
			}) starting with "${REMOTION_BUCKET_PREFIX}". Please see https://remotion.dev/docs/lambda/multiple-buckets.`,
		);
	}

	const {enableFolderExpiry, region} = params;
	if (remotionBuckets.length === 1) {
		const existingBucketName = remotionBuckets[0].name;
		// apply to existing bucket
		await applyLifeCyleOperation({
			enableFolderExpiry: enableFolderExpiry ?? null,
			bucketName: existingBucketName,
			region,
			customCredentials: params.customCredentials,
			forcePathStyle: params.forcePathStyle,
			requestHandler: params.requestHandler,
		});

		await checkBucketListing({
			bucketName: existingBucketName,
			region,
			dnsSuffix: getServiceDnsSuffix(region),
		});

		return {bucketName: remotionBuckets[0].name, alreadyExisted: true};
	}

	const bucketName = makeBucketName(params.region);

	await createBucket({
		bucketName,
		region: params.region,
		forcePathStyle: params.forcePathStyle,
		skipPutAcl: params.skipPutAcl,
		requestHandler: params.requestHandler,
		logLevel: params.logLevel,
	});

	// apply to newly created bucket
	await applyLifeCyleOperation({
		enableFolderExpiry: enableFolderExpiry ?? null,
		bucketName,
		region,
		customCredentials: params.customCredentials,
		forcePathStyle: params.forcePathStyle,
		requestHandler: params.requestHandler,
	});

	return {bucketName, alreadyExisted: false};
};
