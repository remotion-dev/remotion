import {
	CreateBucketCommand,
	DeleteBucketOwnershipControlsCommand,
	DeletePublicAccessBlockCommand,
	PutBucketAclCommand,
} from '@aws-sdk/client-s3';
import type {ProviderSpecifics} from '@remotion/serverless';
import type {AwsRegion} from '../regions';
import {getS3Client} from '../shared/get-s3-client';

export const createBucket: ProviderSpecifics<
	'aws',
	AwsRegion
>['createBucket'] = async ({region, bucketName}) => {
	await getS3Client(region, null).send(
		new CreateBucketCommand({
			Bucket: bucketName,
		}),
	);

	try {
		await getS3Client(region, null).send(
			new DeleteBucketOwnershipControlsCommand({
				Bucket: bucketName,
			}),
		);
	} catch (err) {
		if ((err as Error).message.includes('Access Denied')) {
			throw new Error(
				'Since April 2023, more AWS permissions are required to create an S3 bucket. You need to update your user policy to continue. See https://remotion.dev/docs/lambda/s3-public-access for instructions on how to resolve this issue.',
			);
		}

		throw err;
	}

	try {
		await getS3Client(region, null).send(
			new DeletePublicAccessBlockCommand({
				Bucket: bucketName,
			}),
		);
	} catch (err) {
		if ((err as Error).message.includes('Access Denied')) {
			throw new Error(
				'PARTIAL SUCCESS: The s3:PutBucketOwnershipControls was found, but the s3:PutBucketPublicAccessBlock permission is not given. Since April 2023, more AWS permissions are required to create an S3 bucket. You need to update your user policy to continue. You need to update your user policy to continue. See https://remotion.dev/docs/lambda/s3-public-access for instructions on how to resolve this issue.',
			);
		}

		throw err;
	}

	try {
		await getS3Client(region, null).send(
			new PutBucketAclCommand({
				Bucket: bucketName,
				ACL: 'public-read',
			}),
		);
	} catch (err) {
		if ((err as Error).message.includes('The bucket does not allow ACLs')) {
			throw new Error(
				`Could not add an ACL to the bucket. This might have happened because the bucket was already successfully created before but then failed to configure correctly. We recommend to delete the bucket (${bucketName}) if it is empty and start over to fix the problem.`,
			);
		}

		throw err;
	}
};
