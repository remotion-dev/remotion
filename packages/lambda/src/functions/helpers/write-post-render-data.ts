import type {AwsRegion} from '../../pricing/aws-regions';
import type {PostRenderData} from '../../shared/constants';
import {postRenderDataKey} from '../../shared/constants';
import {lambdaWriteFile} from './io';

export const writePostRenderData = async ({
	bucketName,
	renderId,
	postRenderData,
	expectedBucketOwner,
	region,
}: {
	bucketName: string;
	renderId: string;
	postRenderData: PostRenderData;
	expectedBucketOwner: string;
	region: AwsRegion;
}) => {
	await lambdaWriteFile({
		bucketName,
		key: postRenderDataKey(renderId),
		privacy: 'private',
		body: JSON.stringify(postRenderData),
		expectedBucketOwner,
		region,
		downloadBehavior: null,
	});
};
