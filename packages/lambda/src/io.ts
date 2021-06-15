import {
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	_Object,
} from '@aws-sdk/client-s3';
import {ReadStream} from 'fs';
import {Readable} from 'stream';
import {s3Client} from './shared/aws-clients';

export const lambdaLs = async ({
	bucketName,
	prefix,
}: {
	bucketName: string;
	prefix: string;
}): Promise<_Object[]> => {
	const list = await s3Client.send(
		new ListObjectsV2Command({
			Bucket: bucketName,
			Prefix: prefix,
		})
	);
	return list.Contents ?? [];
};

export const lambdaWriteFile = async ({
	bucketName,
	key,
	body,
}: {
	bucketName: string;
	key: string;
	body: ReadStream | string;
}): Promise<void> => {
	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: key,
			Body: body,
			// TODO: should not be default
			ACL: 'public-read',
		})
	);
};

export const lambdaReadFile = async ({
	bucketName,
	key,
}: {
	bucketName: string;
	key: string;
}): Promise<Readable | Buffer> => {
	const {Body} = await s3Client.send(
		new GetObjectCommand({
			Bucket: bucketName,
			Key: key,
		})
	);
	return Body as Readable;
};
