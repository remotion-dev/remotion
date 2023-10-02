import {getCloudStorageClient} from '../api/helpers/get-cloud-storage-client';

export const validateServeUrl = async (serveUrl: unknown) => {
	if (typeof serveUrl !== 'string') {
		throw new TypeError(
			`"serveURL" parameter must be a string, but is ${JSON.stringify(
				serveUrl,
			)}`,
		);
	}

	// if GCP Storage URL, validate that file exists
	if (serveUrl.startsWith('https://storage.googleapis.com')) {
		const cloudStorageClient = getCloudStorageClient();

		const bucketName = serveUrl.split('/')[3];
		const fileName = serveUrl.split('/').slice(4).join('/');
		const siteName = serveUrl.split('/')[5];

		const [exists] = await cloudStorageClient
			.bucket(bucketName)
			.file(fileName)
			.exists();

		if (!exists) {
			throw new Error(
				`serveURL ERROR. File "${fileName}" not found in bucket "${bucketName}". Is your site name correct - "${siteName}"?`,
			);
		}
	}
};
