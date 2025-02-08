import type {
	CloudProvider,
	CustomCredentials,
	ProviderSpecifics,
	RenderMetadata,
} from '@remotion/serverless-client';
import {getExpectedOutName} from '@remotion/serverless-client';

export type OutputFileMetadata = {
	url: string;
};

export const findOutputFileInBucket = async <Provider extends CloudProvider>({
	region,
	renderMetadata,
	bucketName,
	customCredentials,
	currentRegion,
	providerSpecifics,
	forcePathStyle,
}: {
	region: Provider['region'];
	renderMetadata: RenderMetadata<Provider>;
	bucketName: string;
	customCredentials: CustomCredentials<Provider> | null;
	currentRegion: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
}): Promise<OutputFileMetadata | null> => {
	if (!renderMetadata) {
		throw new Error('unexpectedly did not get renderMetadata');
	}

	const {renderBucketName, key} = getExpectedOutName({
		renderMetadata,
		bucketName,
		customCredentials,
		bucketNamePrefix: providerSpecifics.getBucketPrefix(),
	});

	try {
		await providerSpecifics.headFile({
			bucketName,
			key,
			region,
			customCredentials,
			forcePathStyle,
		});
		return {
			url: providerSpecifics.getOutputUrl({
				renderMetadata,
				bucketName,
				customCredentials,
				currentRegion,
			}).url,
		};
	} catch (err) {
		if ((err as Error).name === 'NotFound') {
			return null;
		}

		if (
			(err as Error).message === 'UnknownError' ||
			(err as {$metadata: {httpStatusCode: number}}).$metadata
				.httpStatusCode === 403
		) {
			throw new Error(
				`Unable to access item "${key}" from bucket "${renderBucketName}" ${
					customCredentials?.endpoint
						? `(S3 Endpoint = ${customCredentials?.endpoint})`
						: ''
				}. The Lambda role must have permission for both "s3:GetObject" and "s3:ListBucket" actions.`,
			);
		}

		throw err;
	}
};
