import {
	CreateBucketCommand,
	DeleteBucketOwnershipControlsCommand,
	DeletePublicAccessBlockCommand,
	PutBucketAclCommand,
} from '@aws-sdk/client-s3';
import type {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';

export const createBucket = async ({
	region,
	bucketName,
}: {
	region: AwsRegion;
	bucketName: string;
}) => {
	await getS3Client(region, null).send(
		new CreateBucketCommand({
			Bucket: bucketName,
		})
	);

	try {
		await getS3Client(region, null).send(
			new DeleteBucketOwnershipControlsCommand({
				Bucket: bucketName,
			})
		);
	} catch (err) {
		if ((err as Error).message.includes('Access Denied')) {
			throw new Error(
				'Since April 2023, more AWS permissions are required to create an S3 bucket. You need to update your user policy to continue.'
			);
		}

		throw err;
	}

	try {
		await getS3Client(region, null).send(
			new DeletePublicAccessBlockCommand({
				Bucket: bucketName,
			})
		);
	} catch (err) {
		if ((err as Error).message.includes('Access Denied')) {
			throw new Error(
				'PARTIAL SUCCESS: Since April 2023, more AWS permissions are required to create an S3 bucket. You need to update your user policy to continue.'
			);
		}

		throw err;
	}

	await getS3Client(region, null).send(
		new PutBucketAclCommand({
			Bucket: bucketName,
			ACL: 'public-read',
		})
	);
};
