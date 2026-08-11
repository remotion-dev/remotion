import type {Bucket} from '@google-cloud/storage';
import type {GcpRegion} from '../pricing/gcp-regions';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

/**
 * @description Get a list of all buckets that were created by Remotion.
 * @param params.region GCP region to check. If not passed, all regions will be checked.
 * @returns {Promise<Bucket[]>} List of buckets returned by GCP.
 */
export const getRemotionStorageBuckets = async (
	region: GcpRegion | 'all regions',
): Promise<{
	remotionBuckets: Bucket[];
}> => {
	const cloudStorageClient = getCloudStorageClient();
	const [buckets] = await cloudStorageClient.getBuckets();
	if (!buckets) {
		return {remotionBuckets: []};
	}

	let remotionBuckets = buckets.filter((b) =>
		b.name?.startsWith(REMOTION_BUCKET_PREFIX),
	);

	if (region !== 'all regions') {
		remotionBuckets = buckets.filter(
			(b) =>
				b.metadata.location === region.toUpperCase() &&
				b.name?.startsWith(REMOTION_BUCKET_PREFIX),
		);
	}

	return {remotionBuckets};
};
