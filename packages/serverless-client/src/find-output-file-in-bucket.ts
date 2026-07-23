import type {CustomCredentials} from './constants';
import {getExpectedOutName} from './expected-out-name';
import type {ProviderSpecifics} from './provider-implementation';
import type {RenderMetadata} from './render-metadata';
import type {CloudProvider} from './types';

export type OutputFileMetadata = {
	url: string;
	sizeInBytes: number | null;
};

export const findOutputFileInBucket = async <Provider extends CloudProvider>({
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
	const {renderBucketName, key} = getExpectedOutName({
		renderMetadata,
		bucketName,
		customCredentials,
		bucketNamePrefix: providerSpecifics.getBucketPrefix(),
	});

	try {
		const metadata = await providerSpecifics.headFile({
			bucketName: renderBucketName,
			key,
			region,
			customCredentials,
			forcePathStyle,
			requestHandler,
		});

		return {
			url: providerSpecifics.getOutputUrl({
				renderMetadata,
				bucketName,
				customCredentials,
				currentRegion,
			}).url,
			sizeInBytes: metadata.ContentLength ?? null,
		};
	} catch (err) {
		if ((err as Error).name === 'NotFound') {
			return null;
		}

		if (
			(err as Error).message === 'UnknownError' ||
			(err as {$metadata: {httpStatusCode: number}}).$metadata
				?.httpStatusCode === 403
		) {
			throw new Error(
				`Unable to access item "${key}" from bucket "${renderBucketName}" ${
					customCredentials?.endpoint
						? `(S3 Endpoint = ${customCredentials?.endpoint})`
						: ''
				} - got a 403 error when heading the file. Check your credentials and permissions. The Lambda role must have permission for both "s3:GetObject" and "s3:ListBucket" actions.`,
				{cause: err},
			);
		}

		throw err;
	}
};
