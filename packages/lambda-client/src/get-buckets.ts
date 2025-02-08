import {GetBucketLocationCommand, ListBucketsCommand} from '@aws-sdk/client-s3';
import type {ProviderSpecifics} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {REMOTION_BUCKET_PREFIX} from './constants';
import {getS3Client} from './get-s3-client';
import type {AwsRegion} from './regions';
import {parseBucketName} from './validate-bucketname';

export type BucketWithLocation = {
	name: string;
	creationDate: number;
	region: AwsRegion;
};

export const getRemotionBuckets: ProviderSpecifics<AwsProvider>['getBuckets'] =
	async ({
		region,
		forceBucketName,
		forcePathStyle,
	}): Promise<BucketWithLocation[]> => {
		const {Buckets} = await getS3Client({
			region,
			customCredentials: null,
			forcePathStyle,
		}).send(new ListBucketsCommand({}));
		if (!Buckets) {
			return [];
		}

		const remotionBuckets = Buckets.filter((b) => {
			if (forceBucketName) {
				return b.Name === forceBucketName;
			}

			return b.Name?.startsWith(REMOTION_BUCKET_PREFIX);
		});

		const locations = await Promise.all(
			remotionBuckets.map(async (bucket) => {
				const {region: parsedRegion} = parseBucketName(bucket.Name as string);
				if (parsedRegion) {
					return parsedRegion;
				}

				try {
					const result = await getS3Client({
						region,
						customCredentials: null,
						forcePathStyle,
					}).send(
						new GetBucketLocationCommand({
							Bucket: bucket.Name as string,
						}),
					);
					// AWS docs: Buckets in Region us-east-1 have a LocationConstraint of null!!
					return result.LocationConstraint ?? ('us-east-1' as AwsRegion);
				} catch (err) {
					// Sometimes the API returns a bucket even if it was deleted before
					if ((err as Error).stack?.includes('NoSuchBucket')) {
						return null;
					}

					throw err;
				}
			}),
		);

		const bucketsWithLocation = remotionBuckets
			.map((bucket, i): BucketWithLocation => {
				return {
					creationDate: (bucket.CreationDate as Date).getTime(),
					name: bucket.Name as string,
					region: locations[i] as AwsRegion,
				};
			})
			.filter((b) => b.region);

		return bucketsWithLocation.filter((bucket) => {
			return bucket.region === region;
		});
	};
