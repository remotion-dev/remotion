import {AwsRegion} from '../../pricing/aws-regions';
import {RenderMetadata, renderMetadataKey} from '../../shared/constants';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';

export const getRenderMetadata = async ({
	exists,
	bucketName,
	renderId,
	region,
}: {
	exists: boolean;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
}) => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: renderMetadataKey(renderId),
		region,
	});

	const renderMetadataResponse = JSON.parse(
		await streamToString(Body)
	) as RenderMetadata;

	return renderMetadataResponse;
};
