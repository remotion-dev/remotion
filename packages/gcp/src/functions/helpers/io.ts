import { getCloudStorageClient } from '../../api/helpers/get-cloud-storage-client';
import { File } from '@google-cloud/storage';

export type GcpLSInput = {
	bucketName: string;
	prefix: string;
};
export type GcpLsReturnType = Promise<File[]>;

export const gcpLs = async ({
	bucketName,
	prefix
}: GcpLSInput): GcpLsReturnType => {
	try {
		const cloudStorageClient = getCloudStorageClient()
		const [files] = await cloudStorageClient.bucket(bucketName).getFiles({ prefix, autoPaginate: true });
		return files;
	} catch (err) {
		throw err;
	}
};

export const gcpDeleteFile = async ({
	bucketName,
	key
}: {
	bucketName: string;
	key: string;
}) => {
	try {
		const cloudStorageClient = getCloudStorageClient()
		await cloudStorageClient.bucket(bucketName).file(key).delete();
	} catch (err) {
		throw err;
	}
}

