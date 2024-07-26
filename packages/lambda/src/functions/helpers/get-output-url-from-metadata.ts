import type {CustomCredentials} from '@remotion/serverless/client';
import type {RenderMetadata} from '../../defaults';
import type {AwsRegion} from '../../regions';
import {getExpectedOutName} from './expected-out-name';

export const getOutputUrlFromMetadata = (
	renderMetadata: RenderMetadata,
	bucketName: string,
	customCredentials: CustomCredentials<AwsRegion> | null,
	currentRegion: AwsRegion,
) => {
	const {key, renderBucketName} = getExpectedOutName(
		renderMetadata,
		bucketName,
		customCredentials,
	);
	return {
		url: `https://s3.${currentRegion}.amazonaws.com/${renderBucketName}/${key}`,
		key,
	};
};
