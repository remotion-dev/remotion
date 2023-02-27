import type {Bucket} from '@google-cloud/storage';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

export const getRemotionStorageBuckets = async (): Promise<{
	remotionBuckets: Bucket[];
}> => {
	// List buckets in this project
	const cloudStorageClient = getCloudStorageClient();
	const [buckets] = await cloudStorageClient.getBuckets();
	if (!buckets) {
		return {remotionBuckets: []};
	}

	// Lambda equivalent code was filtering buckets by region.
	// Instead, I am just returning all buckets that get listed.
	// Not sure if I need to filter them by project ID.

	const remotionBuckets = buckets.filter((b) =>
		b.name?.startsWith(REMOTION_BUCKET_PREFIX)
	);
	return {remotionBuckets};
};
