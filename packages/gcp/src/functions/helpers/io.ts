import type {File} from '@google-cloud/storage';
import {getCloudStorageClient} from '../../api/helpers/get-cloud-storage-client';

export type GcpLSInput = {
	bucketName: string;
	prefix: string;
};
export type GcpLsReturnType = Promise<File[]>;

export const gcpLs = async ({
	bucketName,
	prefix,
}: GcpLSInput): GcpLsReturnType => {
	const cloudStorageClient = getCloudStorageClient();
	const [files] = await cloudStorageClient
		.bucket(bucketName)
		.getFiles({prefix, autoPaginate: true});
	return files;
};

export const gcpDeleteFile = async ({
	bucketName,
	key,
}: {
	bucketName: string;
	key: string;
}) => {
	const cloudStorageClient = getCloudStorageClient();
	await cloudStorageClient.bucket(bucketName).file(key).delete();
};
