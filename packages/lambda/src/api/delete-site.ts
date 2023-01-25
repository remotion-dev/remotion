import {getSitesKey} from '../defaults';
import {lambdaLs} from '../functions/helpers/io';
import type {AwsRegion} from '../pricing/aws-regions';
import {getAccountId} from '../shared/get-account-id';
import {cleanItems} from './clean-items';

export type DeleteSiteInput = {
	bucketName: string;
	siteName: string;
	region: AwsRegion;
	onAfterItemDeleted?: (data: {bucketName: string; itemName: string}) => void;
};

export type DeleteSiteOutput = {
	totalSizeInBytes: number;
};

/**
 *
 * @description Deletes a deployed site from your S3 bucket. The opposite of deploySite().
 * @link https://remotion.dev/docs/lambda/deletesite
 * @param options.bucketName The S3 bucket name where the site resides in.
 * @param options.siteName The ID of the site that you want to delete.
 * @param {AwsRegion} options.region The region in where the S3 bucket resides in.
 * @param options.onAfterItemDeleted Function that gets called after each file that gets deleted, useful for showing progress.
 * @returns {Promise<DeleteSiteOutput>} Object containing info about how much space was freed.
 */
export const deleteSite = async ({
	bucketName,
	siteName,
	region,
	onAfterItemDeleted,
}: DeleteSiteInput): Promise<DeleteSiteOutput> => {
	const accountId = await getAccountId({region});

	let files = await lambdaLs({
		bucketName,
		prefix: getSitesKey(siteName),
		region,
		expectedBucketOwner: accountId,
	});

	let totalSize = 0;

	while (files.length > 0) {
		totalSize += files.reduce((a, b) => {
			return a + (b.Size ?? 0);
		}, 0);
		await cleanItems({
			list: files.map((f) => f.Key as string),
			bucket: bucketName as string,
			onAfterItemDeleted: onAfterItemDeleted ?? (() => undefined),
			onBeforeItemDeleted: () => undefined,
			region,
		});
		files = await lambdaLs({
			bucketName,
			prefix: getSitesKey(siteName),
			region,
			expectedBucketOwner: accountId,
		});
	}

	return {
		totalSizeInBytes: totalSize,
	};
};
