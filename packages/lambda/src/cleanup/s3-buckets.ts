import {DeleteBucketCommand} from '@aws-sdk/client-s3';
import {cleanItems} from '../api/clean-items';
import {getRemotionS3Buckets} from '../api/get-buckets';
import {lambdaLs} from '../functions/helpers/io';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';

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
	let list = await lambdaLs({bucketName: bucket, prefix: '', region});
	while (list.length > 0) {
		await cleanItems({
			list,
			region,
			bucket,
			onAfterItemDeleted,
			onBeforeItemDeleted,
		});
		list = await lambdaLs({bucketName: bucket, prefix: '', region});
	}

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
