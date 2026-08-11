import type {GcpRegion} from '../pricing/gcp-regions';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {makeBucketName} from '../shared/validate-bucketname';
import {createBucket} from './create-bucket';
import {getRemotionStorageBuckets} from './get-buckets';

export type GetOrCreateBucketInput = {
	region: GcpRegion;
	updateBucketState?: (
		state:
			| 'Checking bucket'
			| 'Creating bucket'
			| 'Created bucket'
			| 'Used bucket',
	) => void;
};

export type GetOrCreateBucketOutput = {
	bucketName: string;
	alreadyExisted: boolean;
};
/*
 * @description Creates a Cloud Storage bucket for Remotion Cloud Run in your GCP project. If one already exists, it will get returned instead.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/getorcreatebucket)
 */
export const getOrCreateBucket = async (
	params: GetOrCreateBucketInput,
): Promise<GetOrCreateBucketOutput> => {
	const {remotionBuckets} = await getRemotionStorageBuckets(params.region);

	if (remotionBuckets.length > 1) {
		throw new Error(
			`You have multiple buckets (${remotionBuckets
				.map((b) => b.name)
				.join(', ')}) in your Cloud Storage region (${
				params.region
			}) starting with "${REMOTION_BUCKET_PREFIX}". This is an error, please delete buckets so that you have one maximum.`,
		);
	}

	if (remotionBuckets.length === 1) {
		params?.updateBucketState?.('Used bucket');
		return {
			bucketName: remotionBuckets[0].name,
			alreadyExisted: true,
		};
	}

	if (params?.region) {
		params.updateBucketState?.('Creating bucket');

		const bucketName = makeBucketName();
		await createBucket({
			bucketName,
			region: params.region,
		});

		params.updateBucketState?.('Created bucket');

		return {bucketName, alreadyExisted: false};
	}

	throw new Error(
		'Bucket creation is required, but no region has been passed.',
	);
};
