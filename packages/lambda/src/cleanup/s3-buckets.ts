import {
	DeleteBucketCommand,
	DeleteObjectCommand,
	ListBucketsCommand,
	ListObjectsCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import {CliInternals} from '@remotion/cli';
import pLimit from 'p-limit';
import {Internals} from 'remotion';
import {LAMBDA_BUCKET_PREFIX, RENDERS_BUCKET_PREFIX} from '../constants';

const limit = pLimit(10);

const cleanItems = async (s3client: S3Client, bucket: string) => {
	const list = await s3client.send(
		new ListObjectsCommand({
			Bucket: bucket,
		})
	);
	if (list.Contents && list.Contents.length > 0) {
		await Promise.all(
			list.Contents.map((object) =>
				limit(async () => {
					await s3client.send(
						new DeleteObjectCommand({
							Bucket: bucket,
							Key: object.Key,
						})
					);
					console.log('Deleted', `${bucket}/${object.Key}`);
				})
			)
		);

		await cleanItems(s3client, bucket);
	}
};

const cleanBucket = async (s3client: S3Client, bucket: string) => {
	await cleanItems(s3client, bucket);

	await s3client.send(
		new DeleteBucketCommand({
			Bucket: bucket,
		})
	);
};

export const cleanUpBuckets = CliInternals.xns(async (s3client: S3Client) => {
	const {remotionBuckets} = await getRemotionS3Buckets(s3client);
	if (remotionBuckets.length === 0) {
		return;
	}

	for (const bucket of remotionBuckets) {
		await cleanBucket(s3client, bucket);
	}

	await cleanUpBuckets(s3client);
});

export const getRemotionS3Buckets = async (
	s3Client: S3Client
): Promise<{
	remotionBuckets: string[];
}> => {
	const {Buckets} = await s3Client.send(new ListBucketsCommand({}));
	if (!Buckets) {
		return {remotionBuckets: []};
	}

	const remotionBuckets = Buckets.filter(
		(b) =>
			b.Name?.startsWith(RENDERS_BUCKET_PREFIX) ||
			b.Name?.startsWith(LAMBDA_BUCKET_PREFIX)
	);
	const names = remotionBuckets.map((b) => b.Name).filter(Internals.truthy);
	return {
		remotionBuckets: names,
	};
};
