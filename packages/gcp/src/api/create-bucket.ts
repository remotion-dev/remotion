import type {GcpRegion} from '../pricing/gcp-regions';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

export const createBucket = async ({
	region,
	bucketName,
}: {
	region: GcpRegion;
	bucketName: string;
}) => {
	const cloudStorageClient = getCloudStorageClient()

	// metadata: https://googleapis.dev/nodejs/storage/latest/global.html#CreateBucketRequest
	await cloudStorageClient.createBucket(bucketName, {
		location: region
	});
};
