import {
	DeleteBucketCommand,
	DeleteObjectCommand,
	ListBucketsCommand,
	ListObjectsCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import pLimit from 'p-limit';
import {REMOTION_BUCKET_PREFIX} from '../shared/constants';

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
		onBeforeBucketDeleted?.(bucket.Name as string);
		await cleanBucket({
			s3client,
			bucket: bucket.Name as string,
			onAfterItemDeleted: onAfterItemDeleted ?? (() => undefined),
			onBeforeItemDeleted: onBeforeItemDeleted ?? (() => undefined),
		});
		onAfterBucketDeleted?.(bucket.Name as string);
	}

	await cleanUpBuckets({
		s3client,
		onAfterBucketDeleted,
		onBeforeBucketDeleted,
	});
};

export const getRemotionS3Buckets = async (s3Client: S3Client) => {
	const {Buckets} = await s3Client.send(new ListBucketsCommand({}));
	if (!Buckets) {
		return {remotionBuckets: []};
	}

	const remotionBuckets = Buckets.filter(
		(b) =>
			b.Name?.startsWith(REMOTION_BUCKET_PREFIX) &&
			// TODO: Rename other buckets in Jonnys account bucket first
			!b.Name.startsWith('remotion-binaries')
	);
	return {
		remotionBuckets,
	};
};
