import {
	LambdaClientInternals,
	type CloudProvider,
	type CustomCredentials,
	type OutputFileMetadata,
	type ProviderSpecifics,
	type RenderMetadata,
	type RenderOutput,
} from '@remotion/lambda-client';

export type {OutputFileMetadata} from '@remotion/lambda-client';

export const findOutputFileInBucket = <Provider extends CloudProvider>({
	region,
	renderMetadata,
	bucketName,
	customCredentials,
	currentRegion,
	providerSpecifics,
	forcePathStyle,
	requestHandler,
	output,
}: {
	region: Provider['region'];
	renderMetadata: RenderMetadata<Provider>;
	bucketName: string;
	customCredentials: CustomCredentials<Provider> | null;
	currentRegion: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
	requestHandler: Provider['requestHandler'] | null;
	output: RenderOutput;
}): Promise<OutputFileMetadata | null> => {
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
