import type {RenderMetadata} from '../../defaults';
import type {CustomS3Credentials} from '../../shared/aws-clients';
import {getExpectedOutName} from './expected-out-name';
import {getCurrentRegionInFunction} from './get-current-region';

export const getOutputUrlFromMetadata = (
	renderMetadata: RenderMetadata,
	bucketName: string,
	customCredentials: CustomS3Credentials | null
) => {
	const outname = getExpectedOutName(
		renderMetadata,
		bucketName,
		customCredentials
	);
	return `https://s3.${getCurrentRegionInFunction()}.amazonaws.com/${
		outname.renderBucketName
	}/${outname.key}`;
};
