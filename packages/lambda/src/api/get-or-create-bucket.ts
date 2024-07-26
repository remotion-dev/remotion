import type {CustomCredentials} from '@remotion/serverless/client';
import type {AwsRegion} from '../regions';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {applyLifeCyleOperation} from '../shared/lifecycle-rules';
import {makeBucketName} from '../shared/validate-bucketname';
import {createBucket} from './create-bucket';
import {getRemotionBuckets} from './get-buckets';

type GetOrCreateBucketInputInner = {
	region: AwsRegion;
	enableFolderExpiry: boolean | null;
	customCredentials: CustomCredentials<AwsRegion> | null;
};

export type GetOrCreateBucketInput = {
	region: AwsRegion;
	enableFolderExpiry?: boolean;
	customCredentials?: CustomCredentials<AwsRegion>;
};

export type GetOrCreateBucketOutput = {
	bucketName: string;
	alreadyExisted: boolean;
};

export const internalGetOrCreateBucket = async (
	params: GetOrCreateBucketInputInner,
): Promise<GetOrCreateBucketOutput> => {
	const remotionBuckets = await getRemotionBuckets(params.region);
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
		});

		return {bucketName: remotionBuckets[0].name, alreadyExisted: true};
	}

	const bucketName = makeBucketName(params.region);

	await createBucket({
		bucketName,
		region: params.region,
	});

	// apply to newly created bucket
	await applyLifeCyleOperation({
		enableFolderExpiry: enableFolderExpiry ?? null,
		bucketName,
		region,
		customCredentials: params.customCredentials,
	});

	return {bucketName, alreadyExisted: false};
};

/**
 * @description Creates a bucket for Remotion Lambda in your S3 account. If one already exists, it will get returned instead.
 * @see [Documentation](https://remotion.dev/docs/lambda/getorcreatebucket)
 * @param params.region The region in which you want your S3 bucket to reside in.
 * @returns {Promise<GetOrCreateBucketOutput>} An object containing the `bucketName`.
 */
export const getOrCreateBucket = (options: GetOrCreateBucketInput) => {
	return internalGetOrCreateBucket({
		region: options.region,
		enableFolderExpiry: options.enableFolderExpiry ?? null,
		customCredentials: options.customCredentials ?? null,
	});
};
