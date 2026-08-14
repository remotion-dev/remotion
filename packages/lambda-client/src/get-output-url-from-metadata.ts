import type {GetOutputUrl} from '@remotion/serverless-client';
import {getExpectedOutName} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {getAwsRegionMetadata} from './aws-region-metadata';
import {REMOTION_BUCKET_PREFIX} from './constants';

export const getOutputUrlFromMetadata: GetOutputUrl<AwsProvider> = ({
	renderMetadata,
	bucketName,
	customCredentials,
	currentRegion,
}) => {
	const {key, renderBucketName} = getExpectedOutName({
		renderMetadata,
		bucketName,
		customCredentials,
		bucketNamePrefix: REMOTION_BUCKET_PREFIX,
	});

	const {dnsSuffix} = getAwsRegionMetadata(currentRegion);
	return {
		url: `https://s3.${currentRegion}.${dnsSuffix}/${renderBucketName}/${key}`,
		key,
	};
};
