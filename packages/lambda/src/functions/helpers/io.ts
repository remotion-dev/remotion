import type {_Object} from '@aws-sdk/client-s3';
import {
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
} from '@aws-sdk/client-s3';
import type {
	CustomCredentials,
	DownloadBehavior,
	Privacy,
} from '@remotion/serverless/client';
import mimeTypes from 'mime-types';
import type {ReadStream} from 'node:fs';
import type {Readable} from 'stream';
import type {AwsRegion} from '../../regions';
import {getContentDispositionHeader} from '../../shared/content-disposition-header';
import {getS3Client} from '../../shared/get-s3-client';

export type LambdaLSInput = {
	bucketName: string;
	prefix: string;
	region: AwsRegion;
	expectedBucketOwner: string | null;
	continuationToken?: string;
};
export type LambdaLsReturnType = Promise<_Object[]>;

type LambdaWriteFileInput<Region extends string> = {
	bucketName: string;
	key: string;
	body: ReadStream | string | Uint8Array;
	region: AwsRegion;
	privacy: Privacy;
	expectedBucketOwner: string | null;
	downloadBehavior: DownloadBehavior | null;
	customCredentials: CustomCredentials<Region> | null;
};

const tryLambdaWriteFile = async <Region extends string>({
	bucketName,
	key,
	body,
	region,
	privacy,
	expectedBucketOwner,
	downloadBehavior,
	customCredentials,
}: LambdaWriteFileInput<Region>): Promise<void> => {
	await getS3Client(
		region,
		customCredentials as CustomCredentials<AwsRegion>,
	).send(
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
				: expectedBucketOwner ?? undefined,
			ContentType: mimeTypes.lookup(key) || 'application/octet-stream',
			ContentDisposition: getContentDispositionHeader(downloadBehavior),
		}),
	);
};

export const lambdaWriteFile = async <Region extends string>(
	params: LambdaWriteFileInput<Region> & {
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

		console.warn('Failed to write file to Lambda:');
		console.warn(err);
		console.warn(`Retrying (${remainingRetries} retries remaining)...`);

		return lambdaWriteFile({
			...params,
			retries: remainingRetries - 1,
		});
	}
};

export const lambdaReadFile = async ({
	bucketName,
	key,
	region,
	expectedBucketOwner,
}: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	expectedBucketOwner: string;
}): Promise<Readable> => {
	const {Body} = await getS3Client(region, null).send(
		new GetObjectCommand({
			Bucket: bucketName,
			Key: key,
			ExpectedBucketOwner: expectedBucketOwner,
		}),
	);
	return Body as Readable;
};

export const lambdaHeadCommand = async ({
	bucketName,
	key,
	region,
	customCredentials,
}: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	customCredentials: CustomCredentials<AwsRegion> | null;
}): Promise<{
	LastModified?: Date | undefined;
	ContentLength?: number | undefined;
}> => {
	const head = await getS3Client(region, customCredentials).send(
		new HeadObjectCommand({
			Bucket: bucketName,
			Key: key,
		}),
	);
	return head;
};
