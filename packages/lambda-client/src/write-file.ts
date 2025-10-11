/* eslint-disable no-console */
import type {ObjectCannedACL, PutObjectCommandInput} from '@aws-sdk/client-s3';
import {PutObjectCommand} from '@aws-sdk/client-s3';
import {Upload} from '@aws-sdk/lib-storage';
import type {
	CustomCredentials,
	WriteFileInput,
} from '@remotion/serverless-client';
import mimeTypes from 'mime-types';
import type {AwsProvider} from './aws-provider';
import {getContentDispositionHeader} from './content-disposition-header';
import {getS3Client} from './get-s3-client';

// Files larger than 100MB will use multipart upload
const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 5MB in bytes

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
	storageClass,
	requestHandler,
}: WriteFileInput<AwsProvider>): Promise<void> => {
	const client = getS3Client({
		region,
		customCredentials: customCredentials as CustomCredentials<AwsProvider>,
		forcePathStyle,
		requestHandler,
	});

	const params: PutObjectCommandInput = {
		Bucket: bucketName,
		Key: key,
		Body: body,
		ACL:
			privacy === 'no-acl'
				? undefined
				: ((privacy === 'private'
						? 'private'
						: 'public-read') as ObjectCannedACL),
		ExpectedBucketOwner: customCredentials
			? undefined
			: (expectedBucketOwner ?? undefined),
		ContentType: mimeTypes.lookup(key) || 'application/octet-stream',
		ContentDisposition: getContentDispositionHeader(downloadBehavior),
		StorageClass: storageClass ?? undefined,
	};

	// Determine file size
	const size =
		body instanceof Buffer || body instanceof Uint8Array
			? body.length
			: body instanceof Blob
				? body.size
				: typeof body === 'string'
					? Buffer.from(body).length
					: null;

	// Use multipart upload for large files or streams (where we can't determine size)
	if (size === null || size > MULTIPART_THRESHOLD) {
		const upload = new Upload({
			client,
			params,
			queueSize: 4, // number of concurrent uploads
			partSize: 5 * 1024 * 1024, // chunk size of 5MB
		});

		await upload.done();
	} else {
		// Use regular PutObject for small files
		await client.send(new PutObjectCommand(params));
	}
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
