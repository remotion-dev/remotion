import {RenderInternals} from '@remotion/renderer';
import path from 'node:path';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

/**
 * @description Downloads a file from a GCP storage bucket.
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

	const outputPath = path.resolve(process.cwd(), downloadName);
	RenderInternals.ensureOutputDirectory(outputPath);

	await cloudStorageClient.bucket(bucketName).file(fileName).download({
		destination: outputPath,
	});

	return {outputPath};
};
