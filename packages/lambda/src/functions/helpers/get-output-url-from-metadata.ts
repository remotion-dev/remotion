import type {GetOutputUrl} from '@remotion/serverless';
import {getExpectedOutName} from '@remotion/serverless/client';
import type {AwsProvider} from '../aws-implementation';

export const getOutputUrlFromMetadata: GetOutputUrl<AwsProvider> = ({
	renderMetadata,
	bucketName,
	customCredentials,
	currentRegion,
}) => {
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
