import type {GcpRegion} from '../pricing/gcp-regions';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

type CreateBucketInput = {
	region: GcpRegion;
	bucketName: string;
};

/**
 * @description Creates a bucket for GCP Cloud Run.
 * @param params.region The region for the bucket to be deployed to.
 * @param params.bucketName The name of the bucket.
 * @returns {Promise<void>} Nothing. Throws if the bucket creation failed.
 */
export const createBucket = async ({region, bucketName}: CreateBucketInput) => {
	const cloudStorageClient = getCloudStorageClient();

	// metadata: https://googleapis.dev/nodejs/storage/latest/global.html#CreateBucketRequest
	await cloudStorageClient.createBucket(bucketName, {
		location: region,
	});
};
