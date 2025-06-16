import {GetObjectCommand} from '@aws-sdk/client-s3';
import type {Readable} from 'stream';
import {getS3Client} from './get-s3-client';
import type {AwsRegion} from './regions';
import type {RequestHandler} from './types';

export const lambdaReadFileImplementation = async ({
	bucketName,
	key,
	region,
	expectedBucketOwner,
	forcePathStyle,
	requestHandler,
}: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
}): Promise<Readable> => {
	const {Body} = await getS3Client({
		region,
		customCredentials: null,
		forcePathStyle,
		requestHandler,
	}).send(
		new GetObjectCommand({
			Bucket: bucketName,
			Key: key,
			ExpectedBucketOwner: expectedBucketOwner ?? undefined,
		}),
	);
	return Body as Readable;
};
