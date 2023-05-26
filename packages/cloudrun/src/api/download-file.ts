import fs from 'fs';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

/**
 * @description Downloads a file from a GCP storage bucket.
 * @see [Documentation](https://remotion.dev/docs/lambda/downloadmedia)
 * @param params.bucketName The name of the bucket to download the file from.
 * @param params.gsutilURI The Google Cloud Storage URL of the file to download.
 * @param params.downloadName The name of the file once downloaded.
 * @returns {void}
 */
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
