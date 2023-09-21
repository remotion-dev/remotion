import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

export type DeleteSiteInput = {
	bucketName: string;
	siteName: string;
};

/**
 *
 * @description Deletes a deployed site from your Cloud Run bucket. The opposite of deploySite().
 * @see [Documentation](https://remotion.dev/docs/cloudrun/deletesite)
 * @param params.bucketName The name of the Cloud Storage bucket where the site resides in.
 * @param params.siteName The ID of the site to delete.
 * @returns {Promise<void>} Nothing. Throws if the site failed to delete.
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
