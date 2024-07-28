import type {CloudProvider} from '@remotion/serverless';
import type {RenderMetadata} from '@remotion/serverless/client';
import {
	getExpectedOutName,
	type CustomCredentials,
} from '@remotion/serverless/client';

export const getOutputUrlFromMetadata = <Provider extends CloudProvider>(
	renderMetadata: RenderMetadata<Provider>,
	bucketName: string,
	customCredentials: CustomCredentials<Provider> | null,
	currentRegion: Provider['region'],
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
