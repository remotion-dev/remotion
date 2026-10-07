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
	output,
}) => {
	const {
		key,
		renderBucketName,
		customCredentials: credentials,
	} = getExpectedOutName({
		renderMetadata,
		bucketName,
		customCredentials,
		bucketNamePrefix: REMOTION_BUCKET_PREFIX,
		output,
	});
	if (credentials !== null) {
		const url = new URL(credentials.endpoint);
		if (!credentials.forcePathStyle) {
			url.hostname = `${renderBucketName}.${url.hostname}`;
		}

		url.pathname = `${url.pathname.replace(/\/$/, '')}/${credentials.forcePathStyle ? `${renderBucketName}/` : ''}${key.split('/').map(encodeURIComponent).join('/')}`;
		return {url: url.toString(), key};
	}

	const {dnsSuffix} = getAwsRegionMetadata(currentRegion);
	return {
		url: `https://s3.${currentRegion}.${dnsSuffix}/${renderBucketName}/${key}`,
		key,
	};
};
