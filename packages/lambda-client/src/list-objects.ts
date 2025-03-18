import {ListObjectsV2Command} from '@aws-sdk/client-s3';
import type {ProviderSpecifics} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {getS3Client} from './get-s3-client';

export const lambdaLsImplementation: ProviderSpecifics<AwsProvider>['listObjects'] =
	async ({
		bucketName,
		prefix,
		region,
		expectedBucketOwner,
		continuationToken,
		forcePathStyle,
	}) => {
		try {
			const list = await getS3Client({
				region,
				customCredentials: null,
				forcePathStyle,
			}).send(
				new ListObjectsV2Command({
					Bucket: bucketName,
					Prefix: prefix,
					ExpectedBucketOwner: expectedBucketOwner ?? undefined,
					ContinuationToken: continuationToken,
				}),
			);
			if (list.NextContinuationToken) {
				return [
					...(list.Contents ?? []).map((o) => {
						return {
							Key: o.Key as string,
							LastModified: o.LastModified as Date,
							ETag: o.ETag as string,
							Size: o.Size as number,
						};
					}),
					...(await lambdaLsImplementation({
						bucketName,
						prefix,
						expectedBucketOwner,
						region,
						continuationToken: list.NextContinuationToken,
						forcePathStyle,
					})),
				];
			}

			return (
				(list.Contents || [])?.map((o) => {
					return {
						Key: o.Key as string,
						LastModified: o.LastModified as Date,
						ETag: o.ETag as string,
						Size: o.Size as number,
					};
				}) ?? []
			);
		} catch (err) {
			if (!expectedBucketOwner) {
				throw err;
			}

			// Prevent from accessing a foreign bucket, retry without ExpectedBucketOwner and see if it works. If it works then it's an owner mismatch.
			if ((err as Error).stack?.includes('AccessDenied')) {
				await getS3Client({
					region,
					customCredentials: null,
					forcePathStyle,
				}).send(
					new ListObjectsV2Command({
						Bucket: bucketName,
						Prefix: prefix,
					}),
				);
				throw new Error(
					`Bucket owner mismatch: Expected the bucket ${bucketName} to be owned by you (AWS Account ID: ${expectedBucketOwner}) but it's not the case. Did you accidentially specify the wrong bucket?`,
				);
			}

			throw err;
		}
	};
