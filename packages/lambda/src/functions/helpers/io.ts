import type {_Object} from '@aws-sdk/client-s3';
import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
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
import {getS3Client} from '../../shared/aws-clients';
import {getContentDispositionHeader} from '../../shared/content-disposition-header';

export type LambdaLSInput = {
	bucketName: string;
	prefix: string;
	region: AwsRegion;
	expectedBucketOwner: string | null;
	continuationToken?: string;
};
export type LambdaLsReturnType = Promise<_Object[]>;

export const lambdaLs = async ({
	bucketName,
	prefix,
	region,
	expectedBucketOwner,
	continuationToken,
}: LambdaLSInput): LambdaLsReturnType => {
	try {
		const list = await getS3Client(region, null).send(
			new ListObjectsV2Command({
				Bucket: bucketName,
				Prefix: prefix,
				ExpectedBucketOwner: expectedBucketOwner ?? undefined,
				ContinuationToken: continuationToken,
			}),
		);
		if (list.NextContinuationToken) {
			return [
				...(list.Contents ?? []),
				...(await lambdaLs({
					bucketName,
					prefix,
					expectedBucketOwner,
					region,
					continuationToken: list.NextContinuationToken,
				})),
			];
		}

		return list.Contents ?? [];
	} catch (err) {
		if (!expectedBucketOwner) {
			throw err;
		}

		// Prevent from accessing a foreign bucket, retry without ExpectedBucketOwner and see if it works. If it works then it's an owner mismatch.
		if ((err as Error).stack?.includes('AccessDenied')) {
			await getS3Client(region, null).send(
				new ListObjectsV2Command({
					Bucket: bucketName,
					Prefix: prefix,
				}),
			);
			throw new Error(
				`Bucket owner mismatch: Expected the bucket ${bucketName} to be owned by you (AWS Account ID: ${expectedBucketOwner}) but it's not the case. Did you accidentially specify the wrong bucket?`,
			);
		}

		throw err;
	}
};

export const lambdaDeleteFile = async ({
	bucketName,
	key,
	region,
	customCredentials,
}: {
	region: AwsRegion;
	bucketName: string;
	key: string;
	customCredentials: CustomCredentials<AwsRegion> | null;
}) => {
	await getS3Client(region, customCredentials).send(
		new DeleteObjectCommand({
			Bucket: bucketName,
			Key: key,
		}),
	);
};

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
