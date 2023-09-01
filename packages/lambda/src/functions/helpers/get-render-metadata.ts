import type {AwsRegion} from '../../pricing/aws-regions';
import type {RenderMetadata} from '../../shared/constants';
import {renderMetadataKey} from '../../shared/constants';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';
import type {RenderExpiryDays} from './lifecycle';

export const getRenderMetadata = async ({
	bucketName,
	renderId,
	region,
	expectedBucketOwner,
	renderFolderExpiryInDays,
}: {
	bucketName: string;
	renderId: string;
	region: AwsRegion;
	expectedBucketOwner: string;
	renderFolderExpiryInDays: RenderExpiryDays | null;
}) => {
	const Body = await lambdaReadFile({
		bucketName,
		key: renderMetadataKey(renderId, renderFolderExpiryInDays),
		region,
		expectedBucketOwner,
	});

	const renderMetadataResponse = JSON.parse(
		await streamToString(Body),
	) as RenderMetadata;

	return renderMetadataResponse;
};
