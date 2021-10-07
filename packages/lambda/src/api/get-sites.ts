import {lambdaLs} from '../functions/helpers/io';
import {AwsRegion} from '../pricing/aws-regions';
import {getSitesKey} from '../shared/constants';
import {getAccountId} from '../shared/get-account-id';
import {BucketWithLocation, getRemotionS3Buckets} from './get-buckets';

type Site = {
	sizeInBytes: number;
	lastModified: number | null;
	bucketName: string;
	id: string;
};

type GetSitesReturnValue = {
	sites: Site[];
	buckets: BucketWithLocation[];
};

// TODO: Return the `serveUrl` as well
// TODO: Add JSDoc comments
export const getSites = async ({
	region,
}: {
	region: AwsRegion;
}): Promise<GetSitesReturnValue> => {
	const {remotionBuckets} = await getRemotionS3Buckets(region);
	const accountId = await getAccountId({region});

	const sites: {[key: string]: Site} = {};

	for (const bucket of remotionBuckets) {
		const ls = await lambdaLs({
			bucketName: bucket.name,
			prefix: getSitesKey(''),
			region,
			expectedBucketOwner: accountId,
		});

		for (const file of ls) {
			const siteKeyMatch = file.Key?.match(/sites\/(.*)\/(.*)$/);
			if (!siteKeyMatch) {
				throw new Error(
					`An file was found in the bucket "${bucket.name}" with the key ${file.Key} which is an unexpected folder structure. Delete this file.`
				);
			}

			const [, siteId] = siteKeyMatch;
			if (!sites[siteId]) {
				sites[siteId] = {
					sizeInBytes: 0,
					bucketName: bucket.name,
					lastModified: null,
					id: siteId,
				};
			}

			if (file.LastModified) {
				const currentLastModified = sites[siteId].lastModified;
				if (
					currentLastModified === null ||
					file.LastModified.getTime() > currentLastModified
				) {
					sites[siteId].lastModified = file.LastModified.getTime();
				}
			}

			if (file.Size) {
				sites[siteId].sizeInBytes += file.Size;
			}
		}
	}

	const sitesArray: Site[] = Object.keys(sites).map((siteId) => {
		return sites[siteId];
	});
	return {sites: sitesArray, buckets: remotionBuckets};
};
