import {
	LambdaClientInternals,
	type CustomCredentials,
	type OutputFileMetadata,
	type ProviderSpecifics,
	type RenderMetadata,
	type RenderOutput,
	type AwsRegion,
	type RequestHandler,
} from '@remotion/lambda-client';

export type {OutputFileMetadata} from '@remotion/lambda-client';

type FindOutputFileInBucketInput = {
	region: AwsRegion;
	renderMetadata: RenderMetadata;
	bucketName: string;
	customCredentials: CustomCredentials | null;
	currentRegion: AwsRegion;
	providerSpecifics: ProviderSpecifics;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
	output: RenderOutput;
};

export const findOutputFileInBucket = ({
	region,
	renderMetadata,
	bucketName,
	customCredentials,
	currentRegion,
	providerSpecifics,
	forcePathStyle,
	requestHandler,
	output,
}: FindOutputFileInBucketInput): Promise<OutputFileMetadata | null> => {
	if (!renderMetadata) {
		throw new Error('unexpectedly did not get renderMetadata');
	}

	return LambdaClientInternals.findOutputFileInBucket({
		region,
		renderMetadata,
		bucketName,
		customCredentials,
		currentRegion,
		providerSpecifics,
		forcePathStyle,
		requestHandler,
		output,
	});
};
