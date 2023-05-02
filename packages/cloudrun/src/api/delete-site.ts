import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

export type DeleteSiteInput = {
	bucketName: string;
	siteName: string;
	onAfterItemDeleted?: (data: {bucketName: string; itemName: string}) => void;
};

/**
 *
 * @description Deletes a deployed site from your S3 bucket. The opposite of deploySite().
 * @see [Documentation](https://remotion.dev/docs/lambda/deletesite)
 * @param options.bucketName The S3 bucket name where the site resides in.
 * @param options.siteName The ID of the site that you want to delete.
 * @param {AwsRegion} options.region The region in where the S3 bucket resides in.
 * @param options.onAfterItemDeleted Function that gets called after each file that gets deleted, useful for showing progress.
 * @returns {Promise<void>} Object containing info about how much space was freed.
 */
export const deleteSite = ({
	bucketName,
	siteName,
}: DeleteSiteInput): Promise<void> => {
	return new Promise((resolve, reject) => {
		const cloudStorageClient = getCloudStorageClient();

		cloudStorageClient.bucket(bucketName).deleteFiles(
			{
				prefix: `sites/${siteName}`,
			},
			(err) => {
				if (err) {
					// Reject the Promise with the error
					reject(err);
				} else {
					// Resolve the Promise with the desired result
					resolve();
				}
			}
		);
	});
};
