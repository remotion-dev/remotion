import type {File} from '@google-cloud/storage';
import {getCloudStorageClient} from '../../api/helpers/get-cloud-storage-client';

export type CloudrunLSInput = {
	bucketName: string;
	prefix: string;
};
export type CloudrunLsReturnType = Promise<File[]>;

export const cloudrunLs = async ({
	bucketName,
	prefix,
}: CloudrunLSInput): CloudrunLsReturnType => {
	const cloudStorageClient = getCloudStorageClient();
	const [files] = await cloudStorageClient
		.bucket(bucketName)
		.getFiles({prefix, autoPaginate: true});
	return files;
};

export const cloudrunDeleteFile = async ({
	bucketName,
	key,
}: {
	bucketName: string;
	key: string;
}) => {
	const cloudStorageClient = getCloudStorageClient();
	await cloudStorageClient.bucket(bucketName).file(key).delete();
};
