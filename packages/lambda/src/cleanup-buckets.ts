import {
	DeleteBucketCommand,
	DeleteObjectCommand,
	ListBucketsCommand,
	ListObjectsCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import pLimit from 'p-limit';
import {Internals} from 'remotion';
import xns from 'xns';
import {LAMBDA_BUCKET_PREFIX, REGION, RENDERS_BUCKET_PREFIX} from './constants';

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

export const cleanUpBuckets = xns(
	async (
		s3client: S3Client = new S3Client({
			region: REGION,
		})
	) => {
		// TODO: pagination
		const {Buckets} = await s3client.send(new ListBucketsCommand({}));
		if (!Buckets) {
			console.log('No buckets available.');
			return;
		}

		const remotionBuckets = Buckets.filter(
			(b) =>
				b.Name?.startsWith(RENDERS_BUCKET_PREFIX) ||
				b.Name?.startsWith(LAMBDA_BUCKET_PREFIX)
		);
		const names = remotionBuckets.map((b) => b.Name).filter(Internals.truthy);
		for (const bucket of names) {
			await cleanBucket(s3client, bucket);
		}
	}
);
