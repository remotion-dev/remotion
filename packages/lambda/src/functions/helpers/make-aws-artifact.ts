import {LambdaClientInternals} from '@remotion/lambda-client';
import type {MakeArtifactWithDetails} from '../types';

export const makeAwsArtifact: MakeArtifactWithDetails = ({
	region,
	renderBucketName,
	storageKey,
	artifact,
}) => {
	const {dnsSuffix} = LambdaClientInternals.getAwsRegionMetadata(region);
	return {
		filename: artifact.filename,
		sizeInBytes: artifact.content.length,
		s3Url: `https://s3.${region}.${dnsSuffix}/${renderBucketName}/${storageKey}`,
		s3Key: storageKey,
	};
};
