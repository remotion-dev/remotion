import type {AwsRegion} from '../pricing/aws-regions';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {makeBucketName} from '../shared/validate-bucketname';
import {createBucket} from './create-bucket';
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
 * @see [Documentation](https://remotion.dev/docs/lambda/getorcreatebucket)
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
			}) starting with "${REMOTION_BUCKET_PREFIX}". Please see https://remotion.dev/docs/lambda/multiple-buckets.`
		);
	}

	if (remotionBuckets.length === 1) {
		options.onBucketEnsured?.();
		return {bucketName: remotionBuckets[0].name};
	}

	const bucketName = makeBucketName(options.region);

	await createBucket({
		bucketName,
		region: options.region,
	});
	options.onBucketEnsured?.();

	return {bucketName};
};
