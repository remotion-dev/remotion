import {
	DeleteBucketCommand,
	DeleteObjectCommand,
	ListBucketsCommand,
	ListObjectsCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import xns from 'xns';
import {LAMBDA_BUCKET_PREFIX, REGION, RENDERS_BUCKET_PREFIX} from './constants';

export const cleanUpBuckets = xns(
	async (
		s3client: S3Client = new S3Client({
			region: REGION,
		})
	) => {
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
		const names = remotionBuckets.map((b) => b.Name);
		for (const bucket of names) {
			const list = await s3client.send(
				new ListObjectsCommand({
					Bucket: bucket,
				})
			);
			if (!list.Contents) {
				continue;
			}
			for (const object of list.Contents) {
				await s3client.send(
					new DeleteObjectCommand({
						Bucket: bucket,
						Key: object.Key,
					})
				);
				console.log('Deleted', `${bucket}/${object.Key}`);
			}
			await s3client.send(
				new DeleteBucketCommand({
					Bucket: bucket,
				})
			);
			console.log('Deleted', `${bucket}`);
		}
	}
);
