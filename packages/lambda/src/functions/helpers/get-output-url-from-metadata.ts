import type {CustomCredentials} from '@remotion/serverless/client';
import type {RenderMetadata} from '../../defaults';
import type {AwsRegion} from '../../regions';
import {getExpectedOutName} from './expected-out-name';
import {getCurrentRegionInFunction} from './get-current-region';

export const getOutputUrlFromMetadata = (
	renderMetadata: RenderMetadata,
	bucketName: string,
	customCredentials: CustomCredentials<AwsRegion> | null,
) => {
	const {key, renderBucketName} = getExpectedOutName(
		renderMetadata,
		bucketName,
		customCredentials,
	);
	return {
		url: `https://s3.${getCurrentRegionInFunction()}.amazonaws.com/${renderBucketName}/${key}`,
		key,
	};
};
