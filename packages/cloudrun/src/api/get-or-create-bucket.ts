import type {GcpRegion} from '../pricing/gcp-regions';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {makeBucketName} from '../shared/validate-bucketname';
import {createBucket} from './create-bucket';
import {getRemotionStorageBuckets} from './get-buckets';

export type GetOrCreateBucketInput = {
	region: GcpRegion;
	updateBucketState?: (
		state:
			| 'Checking for existing bucket'
			| 'Creating new bucket'
			| 'Created bucket'
			| 'Using existing bucket'
	) => void;
};

export type GetOrCreateBucketOutput = {
	bucketName: string;
	alreadyExisted: boolean;
};
/**
 * @description Creates a bucket for Remotion Cloud Run in your GCP Project, in a particular region. If one already exists, it will get returned instead.
 * @link https://remotion.dev/docs/cloudrun/getorcreatebucket
 * @param params.region The region in which you want your Storage bucket to reside in.
 * @param params.updateBucketState A function that gets called whenever the state of the bucket changes. This is useful for CLI updates.
 * @returns {Promise<GetOrCreateBucketOutput>} An object containing the `bucketName`.
 */
export const getOrCreateBucket = async (
	params: GetOrCreateBucketInput
): Promise<GetOrCreateBucketOutput> => {
	const {remotionBuckets} = await getRemotionStorageBuckets(params.region);

	if (remotionBuckets.length > 1) {
		throw new Error(
			`You have multiple buckets (${remotionBuckets
				.map((b) => b.name)
				.join(', ')}) in your Cloud Storage region (${
				params.region
			}) starting with "${REMOTION_BUCKET_PREFIX}". This is an error, please delete buckets so that you have one maximum.`
		);
	}

	if (remotionBuckets.length === 1) {
		params?.updateBucketState?.('Using existing bucket');
		return {
			bucketName: remotionBuckets[0].name,
			alreadyExisted: true,
		};
	}

	if (params?.region) {
		params.updateBucketState?.('Creating new bucket');

		const bucketName = makeBucketName();
		await createBucket({
			bucketName,
			region: params.region,
		});

		params.updateBucketState?.('Created bucket');

		return {bucketName, alreadyExisted: false};
	}

	throw new Error(
		'Bucket creation is required, but no region has been passed.'
	);
};
