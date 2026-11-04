import {
	LambdaClientInternals,
	type AwsRegion,
	type RequestHandler,
} from '@remotion/lambda-client';
import {getSitesKey} from '@remotion/lambda-client/constants';

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
	requestHandler: RequestHandler | null;
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
	forcePathStyle,
	requestHandler,
}: DeleteSiteInput & {}): Promise<DeleteSiteOutput> => {
	const accountId = await LambdaClientInternals.getAccountIdImplementation({
		region,
	});

	let files = await LambdaClientInternals.lambdaLsImplementation({
		bucketName,
		// The `/` is important to not accidentially delete sites with the same name but containing a suffix.
		prefix: `${getSitesKey(siteName)}/`,
		region,
		expectedBucketOwner: accountId,
		forcePathStyle,
		requestHandler: null,
	});

	let totalSize = 0;

	while (files.length > 0) {
		totalSize += files.reduce((a, b) => {
			return a + (b.Size ?? 0);
		}, 0);
		await LambdaClientInternals.cleanItems({
			list: files.map((f) => f.Key as string),
			bucket: bucketName as string,
			onAfterItemDeleted: onAfterItemDeleted ?? (() => undefined),
			onBeforeItemDeleted: () => undefined,
			region,
			forcePathStyle,
			requestHandler,
		});
		files = await LambdaClientInternals.lambdaLsImplementation({
			bucketName,
			// The `/` is important to not accidentially delete sites with the same name but containing a suffix.
			prefix: `${getSitesKey(siteName)}/`,
			region,
			expectedBucketOwner: accountId,
			forcePathStyle,
			requestHandler,
		});
	}

	return {
		totalSizeInBytes: totalSize,
	};
};

/*
 * @description Removes a Remotion project from your Cloud Storage bucket.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/deletesite)
 */
export const deleteSite = (
	props: DeleteSiteOptionalInput,
): Promise<DeleteSiteOutput> => {
	return internalDeleteSite({
		...props,
		onAfterItemDeleted: props.onAfterItemDeleted ?? null,
		forcePathStyle: props.forcePathStyle ?? false,
		requestHandler: props.requestHandler ?? null,
	});
};
