import type {GcpRegion} from '../pricing/gcp-regions';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {makeBucketName} from '../shared/validate-bucketname';
import {createBucket} from './create-bucket';
import {getRemotionStorageBuckets} from './get-buckets';

export type GetOrCreateBucketInput = {
	region: GcpRegion;
	onBucketEnsured?: () => void;
};

export type GetOrCreateBucketOutput = {
	bucketName: string;
};
/**
 * @description Creates a bucket for Remotion Cloud Run in your GCP Project. If one already exists, it will get returned instead.
 * @link https://remotion.dev/docs/lambda/getorcreatebucket
 * @param options.region The region in which you want your Storage bucket to reside in.
 * @returns {Promise<GetOrCreateBucketOutput>} An object containing the `bucketName`.
 */
export const getOrCreateBucket = async (
	options: GetOrCreateBucketInput
): Promise<GetOrCreateBucketOutput> => {
	const {remotionBuckets} = await getRemotionStorageBuckets();
	if (remotionBuckets.length > 1) {
		throw new Error(
			`You have multiple buckets (${remotionBuckets.map(
				(b) => b.name
			)}) starting with "${REMOTION_BUCKET_PREFIX}". This is an error, please delete buckets so that you have one maximum.`
		);
	}

	if (remotionBuckets.length === 1) {
		options.onBucketEnsured?.();
		return {bucketName: remotionBuckets[0].name};
	}

	const bucketName = makeBucketName();

	await createBucket({
		bucketName,
		region: options.region,
	});
	options.onBucketEnsured?.();

	return {bucketName};
};
