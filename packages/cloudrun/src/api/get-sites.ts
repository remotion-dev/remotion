import type {GcpRegion} from '../client';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

type Site = {
	lastModified: number | null;
	bucketName: string;
	id: string;
	serveUrl: string;
};

export type GetSitesInput = {
	bucketName?: string;
};

export type BucketWithLocation = {
	name: string;
	creationDate: number;
	region: GcpRegion;
};

export type GetSitesOutput = {
	sites: Site[];
	buckets: BucketWithLocation[];
};

/**
 * @description Gets all the deployed sites for a certain GCP project.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/getsites)
 * @returns {Promise<GetSitesOutput>} A Promise containing an object with `sites` and `bucket` keys. Consult documentation for details.
 */
export const getSites = async (): Promise<GetSitesOutput> => {
	const cloudStorageClient = getCloudStorageClient();
	const buckets: BucketWithLocation[] = [];
	const sites: Site[] = [];

	const [fetchedBuckets] = await cloudStorageClient.getBuckets();

	for (const bucket of fetchedBuckets) {
		if (bucket.name?.startsWith(REMOTION_BUCKET_PREFIX)) {
			const bucketObject = {
				name: bucket.name,
				creationDate: new Date(bucket.metadata?.timeCreated).getTime(),
				region: bucket.metadata.location,
			};
			buckets.push(bucketObject);
		}
	}

	for (const bucket of buckets) {
		const [, , apiResponse] = await cloudStorageClient
			.bucket(bucket.name)
			.getFiles({autoPaginate: false, delimiter: '/', prefix: 'sites/'});

		for (const prefix of apiResponse.prefixes) {
			const sitePath = prefix.split('/');

			sites.push({
				bucketName: bucket.name,
				id: sitePath[1],
				serveUrl: `https://storage.googleapis.com/${bucket.name}/${prefix}index.html`,
				lastModified: null,
			});
		}
	}

	return {sites, buckets};
};
