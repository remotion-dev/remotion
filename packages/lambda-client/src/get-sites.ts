import type {ProviderSpecifics} from '@remotion/serverless-client';
import {
	getRemotionVersionFromIndexHtml,
	streamToString,
	VERSION,
} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {awsImplementation} from './aws-provider';
import {getSitesKey} from './constants';
import type {BucketWithLocation} from './get-buckets';
import {makeS3ServeUrl} from './make-s3-url';
import type {AwsRegion} from './regions';
import type {RequestHandler} from './types';

type Site = {
	sizeInBytes: number;
	lastModified: number | null;
	bucketName: string;
	id: string;
	serveUrl: string;
	version: string | null;
};

type MandatoryParameters = {
	region: AwsRegion;
};

type OptionalParameters = {
	forceBucketName: string | null;
	forcePathStyle: boolean;
	compatibleOnly: boolean;
	requestHandler: RequestHandler | null;
};

type GetSitesInternalInput = MandatoryParameters & OptionalParameters;
export type GetSitesInput = MandatoryParameters & Partial<OptionalParameters>;

export type GetSitesOutput = {
	sites: Site[];
	buckets: BucketWithLocation[];
};

export const internalGetSites = async ({
	region,
	forceBucketName,
	providerSpecifics,
	forcePathStyle,
	compatibleOnly,
	requestHandler,
}: GetSitesInternalInput & {
	providerSpecifics: ProviderSpecifics<AwsProvider>;
}): Promise<GetSitesOutput> => {
	const remotionBuckets = forceBucketName
		? await providerSpecifics.getBuckets({
				region,
				forceBucketName,
				forcePathStyle,
				requestHandler,
			})
		: await providerSpecifics.getBuckets({
				region,
				forceBucketName: null,
				forcePathStyle,
				requestHandler,
			});
	const accountId = await providerSpecifics.getAccountId({region});

	const sites: {[key: string]: Site} = {};

	for (const bucket of remotionBuckets) {
		const ls = await providerSpecifics.listObjects({
			bucketName: bucket.name,
			prefix: getSitesKey(''),
			region,
			expectedBucketOwner: accountId,
			forcePathStyle,
			requestHandler,
		});

		for (const file of ls) {
			const siteKeyMatch = file.Key?.match(
				/sites\/([0-9a-zA-Z-!_.*'()]+)\/(.*)$/,
			);
			if (!siteKeyMatch) {
				throw new Error(
					`A file was found in the bucket "${bucket.name}" with the key ${file.Key} which is an unexpected folder structure. Delete this file.`,
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
					version: null,
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

	await Promise.all(
		sitesArray.map(async (site) => {
			try {
				const body = await providerSpecifics.readFile({
					bucketName: site.bucketName,
					key: `${getSitesKey(site.id)}/index.html`,
					region,
					expectedBucketOwner: accountId,
					forcePathStyle,
					requestHandler,
				});
				const indexHtml = await streamToString(body);
				site.version = getRemotionVersionFromIndexHtml(indexHtml);
			} catch {
				site.version = null;
			}
		}),
	);

	const filtered = compatibleOnly
		? sitesArray.filter((s) => s.version === VERSION)
		: sitesArray;

	return {sites: filtered, buckets: remotionBuckets};
};

/*
 * @description Gets an array of Remotion sites in your S3 bucket.
 * @see [Documentation](https://remotion.dev/docs/lambda/getsites)
 */
export const getSites = ({
	region,
	forceBucketName,
	forcePathStyle,
	compatibleOnly,
	requestHandler,
}: GetSitesInput): Promise<GetSitesOutput> => {
	return internalGetSites({
		region,
		forceBucketName: forceBucketName ?? null,
		forcePathStyle: forcePathStyle ?? false,
		compatibleOnly: compatibleOnly ?? false,
		providerSpecifics: awsImplementation,
		requestHandler: requestHandler ?? null,
	});
};
