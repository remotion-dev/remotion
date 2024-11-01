import type {ProviderSpecifics} from '@remotion/serverless';
import {getSitesKey} from '../defaults';
import type {AwsProvider} from '../functions/aws-implementation';
import {awsImplementation} from '../functions/aws-implementation';
import type {AwsRegion} from '../regions';
import {getAccountId} from '../shared/get-account-id';
import {cleanItems} from './clean-items';

type MandatoryParameters = {
	bucketName: string;
	siteName: string;
	region: AwsRegion;
};

type OptionalParameters = {
	onAfterItemDeleted:
		| ((data: {bucketName: string; itemName: string}) => void)
		| null;
	forcePathStyle: boolean;
};

export type DeleteSiteInput = MandatoryParameters & OptionalParameters;
export type DeleteSiteOptionalInput = MandatoryParameters &
	Partial<OptionalParameters>;

export type DeleteSiteOutput = {
	totalSizeInBytes: number;
};

export const internalDeleteSite = async ({
	bucketName,
	siteName,
	region,
	onAfterItemDeleted,
	providerSpecifics,
	forcePathStyle,
}: DeleteSiteInput & {
	providerSpecifics: ProviderSpecifics<AwsProvider>;
}): Promise<DeleteSiteOutput> => {
	const accountId = await getAccountId({region});

	let files = await providerSpecifics.listObjects({
		bucketName,
		// The `/` is important to not accidentially delete sites with the same name but containing a suffix.
		prefix: `${getSitesKey(siteName)}/`,
		region,
		expectedBucketOwner: accountId,
		forcePathStyle,
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
			providerSpecifics,
			forcePathStyle,
		});
		files = await providerSpecifics.listObjects({
			bucketName,
			// The `/` is important to not accidentially delete sites with the same name but containing a suffix.
			prefix: `${getSitesKey(siteName)}/`,
			region,
			expectedBucketOwner: accountId,
			forcePathStyle,
		});
	}

	return {
		totalSizeInBytes: totalSize,
	};
};

/**
 *
 * @description Deletes a deployed site from your S3 bucket. The opposite of deploySite().
 * @see [Documentation](https://remotion.dev/docs/lambda/deletesite)
 * @param params.bucketName The S3 bucket name where the site resides in.
 * @param params.siteName The ID of the site that you want to delete.
 * @param {AwsRegion} params.region The region in where the S3 bucket resides in.
 * @param params.onAfterItemDeleted Function that gets called after each file that gets deleted, useful for showing progress.
 * @returns {Promise<DeleteSiteOutput>} Object containing info about how much space was freed.
 */
export const deleteSite = (
	props: DeleteSiteOptionalInput,
): Promise<DeleteSiteOutput> => {
	return internalDeleteSite({
		...props,
		onAfterItemDeleted: props.onAfterItemDeleted ?? null,
		forcePathStyle: props.forcePathStyle ?? false,
		providerSpecifics: awsImplementation,
	});
};
