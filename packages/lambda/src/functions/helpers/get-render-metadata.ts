import type {AwsRegion} from '../../pricing/aws-regions';
import type {RenderMetadata} from '../../shared/constants';
import {renderMetadataKey} from '../../shared/constants';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';

export const getRenderMetadata = async ({
	bucketName,
	renderId,
	region,
	expectedBucketOwner,
}: {
	bucketName: string;
	renderId: string;
	region: AwsRegion;
	expectedBucketOwner: string;
}) => {
	const Body = await lambdaReadFile({
		bucketName,
		key: renderMetadataKey(renderId),
		region,
		expectedBucketOwner,
	});

	const renderMetadataResponse = JSON.parse(
		await streamToString(Body)
	) as RenderMetadata;

	return renderMetadataResponse;
};
