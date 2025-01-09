import type {MakeArtifactWithDetails} from '@remotion/serverless';
import type {AwsProvider} from '../aws-implementation';

export const makeAwsArtifact: MakeArtifactWithDetails<AwsProvider> = ({
	region,
	renderBucketName,
	storageKey,
	artifact,
}) => {
	return {
		filename: artifact.filename,
		sizeInBytes: artifact.content.length,
		s3Url: `https://s3.${region}.amazonaws.com/${renderBucketName}/${storageKey}`,
		s3Key: storageKey,
	};
};
