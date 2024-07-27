import type {CustomCredentials} from '@remotion/serverless/client';
import type {RenderMetadata} from '../../defaults';
import {getExpectedOutName} from './expected-out-name';

export const getOutputUrlFromMetadata = <Region extends string>(
	renderMetadata: RenderMetadata<Region>,
	bucketName: string,
	customCredentials: CustomCredentials<Region> | null,
	currentRegion: Region,
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
