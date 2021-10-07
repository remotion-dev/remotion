import {AwsRegion} from '..';
import {getSitesKey} from '../defaults';
import {lambdaLs} from '../functions/helpers/io';
import {getAccountId} from '../shared/get-account-id';
import {cleanItems} from './clean-items';

type DeleteSiteReturnData = {
	totalSize: number;
};

// TODO: Write JSDoc annotations
export const deleteSite = async ({
	bucketName,
	siteName,
	region,
	onAfterItemDeleted,
}: {
	bucketName: string;
	siteName: string;
	region: AwsRegion;
	onAfterItemDeleted?: (data: {bucketName: string; itemName: string}) => void;
}): Promise<DeleteSiteReturnData> => {
	const accountId = await getAccountId({region});

	let files = await lambdaLs({
		bucketName,
		prefix: getSitesKey(siteName),
		region,
		expectedBucketOwner: accountId,
	});

	if (files.length === 0) {
		return {
			totalSize: 0,
		};
	}

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
		totalSize,
	};
};
