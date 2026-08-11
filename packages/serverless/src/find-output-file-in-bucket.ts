import type {
	CloudProvider,
	CustomCredentials,
	OutputFileMetadata,
	ProviderSpecifics,
	RenderMetadata,
} from '@remotion/serverless-client';
import {findOutputFileInBucket as findOutputFileInBucketShared} from '@remotion/serverless-client';

export type {OutputFileMetadata} from '@remotion/serverless-client';

export const findOutputFileInBucket = <Provider extends CloudProvider>({
	region,
	renderMetadata,
	bucketName,
	customCredentials,
	currentRegion,
	providerSpecifics,
	forcePathStyle,
	requestHandler,
}: {
	region: Provider['region'];
	renderMetadata: RenderMetadata<Provider>;
	bucketName: string;
	customCredentials: CustomCredentials<Provider> | null;
	currentRegion: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
	requestHandler: Provider['requestHandler'] | null;
}): Promise<OutputFileMetadata | null> => {
	if (!renderMetadata) {
		throw new Error('unexpectedly did not get renderMetadata');
	}

	return findOutputFileInBucketShared({
		region,
		renderMetadata,
		bucketName,
		customCredentials,
		currentRegion,
		providerSpecifics,
		forcePathStyle,
		requestHandler,
	});
};
