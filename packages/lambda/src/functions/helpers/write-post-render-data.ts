import type {AwsRegion} from '../../pricing/aws-regions';
import type {PostRenderData} from '../../shared/constants';
import {postRenderDataKey} from '../../shared/constants';
import {lambdaWriteFile} from './io';
import type {RenderExpiryDays} from './lifecycle';

export const writePostRenderData = async ({
	bucketName,
	renderId,
	postRenderData,
	expectedBucketOwner,
	region,
	renderFolderExpiryInDays,
}: {
	bucketName: string;
	renderId: string;
	postRenderData: PostRenderData;
	expectedBucketOwner: string;
	region: AwsRegion;
	renderFolderExpiryInDays: RenderExpiryDays | null;
}) => {
	await lambdaWriteFile({
		bucketName,
		key: postRenderDataKey(renderId, renderFolderExpiryInDays),
		privacy: 'private',
		body: JSON.stringify(postRenderData),
		expectedBucketOwner,
		region,
		downloadBehavior: null,
		customCredentials: null,
	});
};
