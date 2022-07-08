import {lambdaLs} from '../functions/helpers/io';
import type {AwsRegion} from '../pricing/aws-regions';
import {getSitesKey} from '../shared/constants';
import {getAccountId} from '../shared/get-account-id';
import {makeS3ServeUrl} from '../shared/make-s3-url';
import type {BucketWithLocation} from './get-buckets';
import { getRemotionS3Buckets} from './get-buckets';

type Site = {
	sizeInBytes: number;
	lastModified: number | null;
	bucketName: string;
	id: string;
	serveUrl: string;
};

export type GetSitesInput = {
	region: AwsRegion;
};

export type GetSitesOutput = {
	sites: Site[];
	buckets: BucketWithLocation[];
};

/**
 *
 * @description Gets all the deployed sites for a certain AWS region.
 * @link https://remotion.dev/docs/lambda/getsites
 * @param {AwsRegion} params.region The AWS region that you want to query for.
 * @returns {Promise<GetSitesOutput>} A Promise containing an object with `sites` and `bucket` keys. Consult documentation for details.
 */
export const getSites = async ({
	region,
}: GetSitesInput): Promise<GetSitesOutput> => {
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
			const siteKeyMatch = file.Key?.match(
				/sites\/([0-9a-zA-Z-!_.*'()]+)\/(.*)$/
			);
			if (!siteKeyMatch) {
				throw new Error(
					`A file was found in the bucket "${bucket.name}" with the key ${file.Key} which is an unexpected folder structure. Delete this file.`
				);
			}

			const [, siteId] = siteKeyMatch;
			if (!sites[siteId]) {
				sites[siteId] = {
					sizeInBytes: 0,
					bucketName: bucket.name,
					lastModified: null,
					id: siteId,
					serveUrl: makeS3ServeUrl({
						bucketName: bucket.name,
						region,
						subFolder: getSitesKey(siteId),
					}),
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
