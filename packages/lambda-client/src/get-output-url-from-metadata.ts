import {S3Client} from '@aws-sdk/client-s3';
import type {GetOutputUrl} from '@remotion/serverless-client';
import {getExpectedOutName} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {getAwsRegionMetadata} from './aws-region-metadata';
import {REMOTION_BUCKET_PREFIX} from './constants';

const {endpointProvider} = new S3Client({region: 'us-east-1'}).config;

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
		const url = new URL(
			endpointProvider(
				{
					Bucket: renderBucketName,
					Endpoint: credentials.endpoint,
					Region: credentials.region ?? currentRegion,
					// The SDK's S3 middleware also forces path style for dotted buckets.
					ForcePathStyle:
						credentials.forcePathStyle === true ||
						renderBucketName.includes('.'),
					UseFIPS: false,
					UseDualStack: false,
				},
				{},
			).url,
		);
		url.pathname = `${url.pathname.replace(/\/$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`;
		return {url: url.toString(), key};
	}

	const {dnsSuffix} = getAwsRegionMetadata(currentRegion);
	if (renderMetadata.type === 'sequence') {
		const endpoint =
			customCredentials?.endpoint ?? `https://s3.${currentRegion}.${dnsSuffix}`;
		const url = new URL(endpoint);
		url.pathname =
			url.pathname.replace(/\/$/, '') +
			`/${encodeURIComponent(renderBucketName)}/${key.split('/').map(encodeURIComponent).join('/')}`;
		return {url: url.toString(), key};
	}

	return {
		url: `https://s3.${currentRegion}.${dnsSuffix}/${renderBucketName}/${key}`,
		key,
	};
};
