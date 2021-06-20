import {
	DeleteBucketCommand,
	DeleteObjectCommand,
	ListObjectsCommand,
} from '@aws-sdk/client-s3';
import pLimit from 'p-limit';
import {getRemotionS3Buckets} from '../api/get-buckets';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';

const limit = pLimit(10);

const cleanItems = async ({
	bucket,
	onAfterItemDeleted,
	onBeforeItemDeleted,
	region,
}: {
	bucket: string;
	region: AwsRegion;
	onBeforeItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	onAfterItemDeleted: (data: {bucketName: string; itemName: string}) => void;
}) => {
	const list = await getS3Client(region).send(
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
					await getS3Client(region).send(
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
			region,
			bucket,
			onAfterItemDeleted,
			onBeforeItemDeleted,
		});
	}
};

const cleanBucket = async ({
	region,
	bucket,
	onAfterItemDeleted,
	onBeforeItemDeleted,
}: {
	region: AwsRegion;
	bucket: string;
	onAfterItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	onBeforeItemDeleted: (data: {bucketName: string; itemName: string}) => void;
}) => {
	await cleanItems({region, bucket, onAfterItemDeleted, onBeforeItemDeleted});

	await getS3Client(region).send(
		new DeleteBucketCommand({
			Bucket: bucket,
		})
	);
};

export const cleanUpBuckets = async ({
	region,
	onBeforeBucketDeleted,
	onAfterBucketDeleted,
	onAfterItemDeleted,
	onBeforeItemDeleted,
}: {
	region: AwsRegion;
	onBeforeBucketDeleted?: (bucketName: string) => void;
	onAfterItemDeleted?: (data: {bucketName: string; itemName: string}) => void;
	onBeforeItemDeleted?: (data: {bucketName: string; itemName: string}) => void;
	onAfterBucketDeleted?: (bucketName: string) => void;
}) => {
	const {remotionBuckets} = await getRemotionS3Buckets(region);
	if (remotionBuckets.length === 0) {
		return;
	}

	for (const bucket of remotionBuckets) {
		onBeforeBucketDeleted?.(bucket.Name as string);
		await cleanBucket({
			region,
			bucket: bucket.Name as string,
			onAfterItemDeleted: onAfterItemDeleted ?? (() => undefined),
			onBeforeItemDeleted: onBeforeItemDeleted ?? (() => undefined),
		});
		onAfterBucketDeleted?.(bucket.Name as string);
	}

	await cleanUpBuckets({
		region,
		onAfterBucketDeleted,
		onBeforeBucketDeleted,
	});
};
