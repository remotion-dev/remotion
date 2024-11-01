import type {GcpRegion} from '../pricing/gcp-regions';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

export type Site = {
	bucketName: string;
	id: string;
	serveUrl: string;
	bucketRegion: GcpRegion;
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
 * @description Gets all the deployed sites for a certain GCP project, within the specified region.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/getsites)
 * @param {GcpRegion} params.region The GCP region that you want to query for.
 * @returns {Promise<GetSitesOutput>} A Promise containing an object with `sites` and `bucket` keys. Consult documentation for details.
 */
export const getSites = async (
	region: GcpRegion | 'all regions',
): Promise<GetSitesOutput> => {
	const cloudStorageClient = getCloudStorageClient();
	const buckets: BucketWithLocation[] = [];
	const sites: Site[] = [];

	const [fetchedBuckets] = await cloudStorageClient.getBuckets();

	for (const bucket of fetchedBuckets) {
		if (
			bucket.name?.startsWith(REMOTION_BUCKET_PREFIX) &&
			(region === 'all regions' ||
				bucket.metadata.location === region.toUpperCase())
		) {
			const bucketObject = {
				name: bucket.name,
				creationDate: new Date(
					bucket.metadata?.timeCreated as string,
				).getTime(),
				region: (bucket.metadata.location as string).toLowerCase() as GcpRegion,
			};
			buckets.push(bucketObject);
		}
	}

	for (const bucket of buckets) {
		const [, , apiResponse] = await cloudStorageClient
			.bucket(bucket.name)
			.getFiles({autoPaginate: false, delimiter: '/', prefix: 'sites/'});

		if (!(apiResponse as any).prefixes) {
			continue; // no sites folder within bucket
		}

		for (const prefix of (apiResponse as any).prefixes) {
			const sitePath = prefix.split('/');

			sites.push({
				bucketName: bucket.name,
				id: sitePath[1],
				serveUrl: `https://storage.googleapis.com/${bucket.name}/${prefix}index.html`,
				bucketRegion: bucket.region,
			});
		}
	}

	return {sites, buckets};
};
