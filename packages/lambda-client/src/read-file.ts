import {GetObjectCommand} from '@aws-sdk/client-s3';
import type {Readable} from 'stream';
import {getS3Client} from './get-s3-client';
import type {AwsRegion} from './regions';

export const lambdaReadFileImplementation = async ({
	bucketName,
	key,
	region,
	expectedBucketOwner,
	forcePathStyle,
}: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
}): Promise<Readable> => {
	const {Body} = await getS3Client({
		region,
		customCredentials: null,
		forcePathStyle,
	}).send(
		new GetObjectCommand({
			Bucket: bucketName,
			Key: key,
			ExpectedBucketOwner: expectedBucketOwner ?? undefined,
		}),
	);
	return Body as Readable;
};
