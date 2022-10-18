import type {AwsRegion} from '../pricing/aws-regions';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {randomHash} from '../shared/random-hash';
import {createBucket} from './create-bucket';
import {enableS3Website} from './enable-s3-website';
import {getRemotionS3Buckets} from './get-buckets';

export type GetOrCreateBucketInput = {
	region: AwsRegion;
	onBucketEnsured?: () => void;
};

export type GetOrCreateBucketOutput = {
	bucketName: string;
};
/**
 * @description Creates a bucket for Remotion Lambda in your S3 account. If one already exists, it will get returned instead.
 * @link https://remotion.dev/docs/lambda/getorcreatebucket
 * @param options.region The region in which you want your S3 bucket to reside in.
 * @returns {Promise<GetOrCreateBucketOutput>} An object containing the `bucketName`.
 */
export const getOrCreateBucket = async (
	options: GetOrCreateBucketInput
): Promise<GetOrCreateBucketOutput> => {
	const {remotionBuckets} = await getRemotionS3Buckets(options.region);
	if (remotionBuckets.length > 1) {
		throw new Error(
			`You have multiple buckets (${remotionBuckets.map(
				(b) => b.name
			)}) in your S3 region (${
				options.region
			}) starting with "${REMOTION_BUCKET_PREFIX}". This is an error, please delete buckets so that you have one maximum.`
		);
	}

	if (remotionBuckets.length === 1) {
		options.onBucketEnsured?.();
		return {bucketName: remotionBuckets[0].name};
	}

	const bucketName = REMOTION_BUCKET_PREFIX + randomHash();

	await createBucket({
		bucketName,
		region: options.region,
	});
	options.onBucketEnsured?.();
	await enableS3Website({
		region: options.region,
		bucketName,
	});

	return {bucketName};
};
