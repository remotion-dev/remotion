import fs from 'fs';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

export const downloadFile = async ({
	bucketName,
	gsutilURI,
	downloadName,
}: {
	bucketName: string;
	gsutilURI: string;
	downloadName: string;
}) => {
	const cloudStorageClient = getCloudStorageClient();

	const fileName = gsutilURI.replace(`gs://${bucketName}/`, '');

	// check if out folder exists, if not, create it
	if (!fs.existsSync('out')) {
		fs.mkdirSync('out');
	}

	const destination = `out/${downloadName}`;

	await cloudStorageClient.bucket(bucketName).file(fileName).download({
		destination,
	});

	return destination;
};
