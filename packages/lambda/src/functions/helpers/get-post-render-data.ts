import type {AwsRegion} from '../../pricing/aws-regions';
import type {PostRenderData} from '../../shared/constants';
import {postRenderDataKey} from '../../shared/constants';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';

export const getPostRenderData = async ({
	bucketName,
	renderId,
	region,
	expectedBucketOwner,
}: {
	bucketName: string;
	renderId: string;
	region: AwsRegion;
	expectedBucketOwner: string;
}): Promise<PostRenderData | null> => {
	try {
		const data = await lambdaReadFile({
			bucketName,
			key: postRenderDataKey(renderId),
			region,
			expectedBucketOwner,
		});
		return JSON.parse(await streamToString(data)) as PostRenderData;
	} catch (err) {
		// Does not exist
		return null;
	}
};
