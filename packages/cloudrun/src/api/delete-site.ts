import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

export type DeleteSiteInput = {
	bucketName: string;
	siteName: string;
};

/*
 * @description Removes a Remotion project from your Cloud Storage bucket.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/deletesite)
 */
export const deleteSite = ({
	bucketName,
	siteName,
}: DeleteSiteInput): Promise<void> => {
	return new Promise((resolve, reject) => {
		const cloudStorageClient = getCloudStorageClient();

		cloudStorageClient.bucket(bucketName).deleteFiles(
			{
				// The `/` is important to not accidentially delete sites with the same name but containing a suffix.
				prefix: `sites/${siteName}/`,
			},
			(err) => {
				if (err) {
					// Reject the Promise with the error
					reject(err);
				} else {
					// Resolve the Promise with the desired result
					resolve();
				}
			},
		);
	});
};
