import {_Object} from '@aws-sdk/client-s3';
import {AwsRegion} from '../..';
import {outName, RenderMetadata} from '../../shared/constants';

export const findOutputFileInBucket = ({
	output,
	renderMetadata,
	bucketName,
	renderId,
}: {
	output: _Object | null;
	renderMetadata: RenderMetadata | null;
	bucketName: string;
	renderId: string;
}) => {
	if (!output) {
		return null;
	}

	if (!renderMetadata) {
		throw new Error('unexpectedly did not get renderMetadata');
	}

	return `https://s3.${
		process.env.AWS_REGION as AwsRegion
	}.amazonaws.com/${bucketName}/${outName(renderId, renderMetadata.codec)}`;
};
