import type {Bucket} from '@google-cloud/storage';
import type {GcpRegion} from '../pricing/gcp-regions';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

export const getRemotionStorageBuckets = async (
	region: GcpRegion | 'all regions'
): Promise<{
	remotionBuckets: Bucket[];
}> => {
	const cloudStorageClient = getCloudStorageClient();
	const [buckets] = await cloudStorageClient.getBuckets();
	if (!buckets) {
		return {remotionBuckets: []};
	}

	let remotionBuckets = buckets.filter((b) =>
		b.name?.startsWith(REMOTION_BUCKET_PREFIX)
	);

	if (region !== 'all regions') {
		remotionBuckets = buckets.filter(
			(b) => b.metadata.location === region.toUpperCase()
		);
	}

	return {remotionBuckets};
};
