import {
	DeleteBucketCommand,
	DeleteObjectCommand,
	ListBucketsCommand,
	ListObjectsCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import pLimit from 'p-limit';
import {Internals} from 'remotion';
import {LAMBDA_S3_WEBSITE_DEPLOY, RENDERS_BUCKET_PREFIX} from '../constants';

const limit = pLimit(10);

const cleanItems = async ({
	s3client,
	bucket,
	onAfterItemDeleted,
	onBeforeItemDeleted,
}: {
	s3client: S3Client;
	bucket: string;
	onBeforeItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	onAfterItemDeleted: (data: {bucketName: string; itemName: string}) => void;
}) => {
	const list = await s3client.send(
		new ListObjectsCommand({
			Bucket: bucket,
		})
	);
	if (list.Contents && list.Contents.length > 0) {
		await Promise.all(
			list.Contents.map((object) =>
				limit(async () => {
					onBeforeItemDeleted({
						bucketName: bucket,
						itemName: object.Key as string,
					});
					await s3client.send(
						new DeleteObjectCommand({
							Bucket: bucket,
							Key: object.Key,
						})
					);
					onAfterItemDeleted({
						bucketName: bucket,
						itemName: object.Key as string,
					});
				})
			)
		);

		await cleanItems({
			s3client,
			bucket,
			onAfterItemDeleted,
			onBeforeItemDeleted,
		});
	}
};

const cleanBucket = async ({
	s3client,
	bucket,
	onAfterItemDeleted,
	onBeforeItemDeleted,
}: {
	s3client: S3Client;
	bucket: string;
	onAfterItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	onBeforeItemDeleted: (data: {bucketName: string; itemName: string}) => void;
}) => {
	await cleanItems({s3client, bucket, onAfterItemDeleted, onBeforeItemDeleted});

	await s3client.send(
		new DeleteBucketCommand({
			Bucket: bucket,
		})
	);
};

export const cleanUpBuckets = async ({
	s3client,
	onBeforeBucketDeleted,
	onAfterBucketDeleted,
	onAfterItemDeleted,
	onBeforeItemDeleted,
}: {
	s3client: S3Client;
	onBeforeBucketDeleted?: (bucketName: string) => void;
	onAfterItemDeleted?: (data: {bucketName: string; itemName: string}) => void;
	onBeforeItemDeleted?: (data: {bucketName: string; itemName: string}) => void;
	onAfterBucketDeleted?: (bucketName: string) => void;
}) => {
	const {remotionBuckets} = await getRemotionS3Buckets(s3client);
	if (remotionBuckets.length === 0) {
		return;
	}

	for (const bucket of remotionBuckets) {
		onBeforeBucketDeleted?.(bucket);
		await cleanBucket({
			s3client,
			bucket,
			onAfterItemDeleted: onAfterItemDeleted ?? (() => undefined),
			onBeforeItemDeleted: onBeforeItemDeleted ?? (() => undefined),
		});
		onAfterBucketDeleted?.(bucket);
	}

	await cleanUpBuckets({
		s3client,
		onAfterBucketDeleted,
		onBeforeBucketDeleted,
	});
};

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
			b.Name?.startsWith(LAMBDA_S3_WEBSITE_DEPLOY)
	);
	const names = remotionBuckets.map((b) => b.Name).filter(Internals.truthy);
	return {
		remotionBuckets: names,
	};
};
