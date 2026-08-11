import {
	CreateBucketCommand,
	DeleteBucketOwnershipControlsCommand,
	DeletePublicAccessBlockCommand,
	PutBucketAclCommand,
	PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import type {ProviderSpecifics} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {getS3Client} from './get-s3-client';

export const createBucket: ProviderSpecifics<AwsProvider>['createBucket'] =
	async ({region, bucketName, forcePathStyle, requestHandler}) => {
		await getS3Client({
			region,
			customCredentials: null,
			forcePathStyle,
			requestHandler,
		}).send(
			new CreateBucketCommand({
				Bucket: bucketName,
			}),
		);

		try {
			await getS3Client({
				region,
				customCredentials: null,
				forcePathStyle,
				requestHandler,
			}).send(
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
			await getS3Client({
				region,
				customCredentials: null,
				forcePathStyle,
				requestHandler,
			}).send(
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

		let usedBucketPolicy = false;
		try {
			const policy = JSON.stringify({
				Version: '2012-10-17',
				Statement: [
					{
						Sid: 'PublicReadGetObject',
						Effect: 'Allow',
						Principal: '*',
						Action: 's3:GetObject',
						Resource: `arn:aws:s3:::${bucketName}/*`,
					},
				],
			});
			await getS3Client({
				region,
				customCredentials: null,
				forcePathStyle,
				requestHandler,
			}).send(
				new PutBucketPolicyCommand({
					Bucket: bucketName,
					Policy: policy,
				}),
			);
			usedBucketPolicy = true;
		} catch {
			// eslint-disable-next-line no-console
			console.warn(
				'Could not apply a bucket policy to restrict public access to s3:GetObject only. Falling back to public-read ACL which also allows listing objects. To fix this, add the s3:PutBucketPolicy permission to your IAM user. See https://remotion.dev/docs/lambda/bucket-security',
			);
		}

		try {
			await getS3Client({
				region,
				customCredentials: null,
				forcePathStyle,
				requestHandler,
			}).send(
				new PutBucketAclCommand({
					Bucket: bucketName,
					ACL: usedBucketPolicy ? 'private' : 'public-read',
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
