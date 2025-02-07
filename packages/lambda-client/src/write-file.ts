/* eslint-disable no-console */
import {PutObjectCommand} from '@aws-sdk/client-s3';
import type {
	CustomCredentials,
	WriteFileInput,
} from '@remotion/serverless-client';
import mimeTypes from 'mime-types';
import type {AwsProvider} from './aws-provider';
import {getContentDispositionHeader} from './content-disposition-header';
import {getS3Client} from './get-s3-client';

const tryLambdaWriteFile = async ({
	bucketName,
	key,
	body,
	region,
	privacy,
	expectedBucketOwner,
	downloadBehavior,
	customCredentials,
	forcePathStyle,
}: WriteFileInput<AwsProvider>): Promise<void> => {
	await getS3Client({
		region,
		customCredentials: customCredentials as CustomCredentials<AwsProvider>,
		forcePathStyle,
	}).send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: key,
			Body: body,
			ACL:
				privacy === 'no-acl'
					? undefined
					: privacy === 'private'
						? 'private'
						: 'public-read',
			ExpectedBucketOwner: customCredentials
				? undefined
				: (expectedBucketOwner ?? undefined),
			ContentType: mimeTypes.lookup(key) || 'application/octet-stream',
			ContentDisposition: getContentDispositionHeader(downloadBehavior),
		}),
	);
};

export const lambdaWriteFileImplementation = async (
	params: WriteFileInput<AwsProvider> & {
		retries?: number;
	},
): Promise<void> => {
	const remainingRetries = params.retries ?? 2;
	try {
		await tryLambdaWriteFile(params);
	} catch (err) {
		if (remainingRetries === 0) {
			throw err;
		}

		const backoff = 2 ** (2 - remainingRetries) * 2000;
		await new Promise((resolve) => {
			setTimeout(resolve, backoff);
		});

		console.warn('Failed to write file to storage:');
		console.warn(err);
		console.warn(`Retrying (${remainingRetries} retries remaining)...`);

		return lambdaWriteFileImplementation({
			...params,
			retries: remainingRetries - 1,
		});
	}
};
