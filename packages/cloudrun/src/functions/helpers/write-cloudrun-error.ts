import {Storage} from '@google-cloud/storage';
import fs from 'node:fs';

export type CloudrunErrorInfo = {
	type: 'renderer' | 'browser' | 'stitcher' | 'webhook';
	message: string;
	name: string;
	stack: string;
};

export const writeCloudrunError = async ({
	bucketName,
	renderId,
	errorInfo,
	publicUpload,
}: {
	bucketName: string;
	renderId: string;
	errorInfo: CloudrunErrorInfo;
	publicUpload: boolean;
}) => {
	const storage = new Storage();

	const tempFilePath = '/tmp/errorInfo.txt';

	fs.writeFileSync(tempFilePath, JSON.stringify(errorInfo));

	await storage.bucket(bucketName).upload(tempFilePath, {
		destination: `renders/${renderId}/error.txt`,
		predefinedAcl: publicUpload ? 'publicRead' : 'projectPrivate',
	});
};
