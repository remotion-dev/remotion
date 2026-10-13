import type {CustomCredentials, RenderOutput} from './constants';
import {getExpectedOutName} from './expected-out-name';
import type {ProviderSpecifics} from './provider-implementation';
import type {RenderMetadata} from './render-metadata';
import type {CloudProvider} from './types';

export type OutputFileMetadata = {
	url: string;
	sizeInBytes: number | null;
};

const outputFileAccessDenied = Symbol.for(
	'remotion.OutputFileAccessDeniedError',
);

export class OutputFileAccessDeniedError extends Error {
	[outputFileAccessDenied] = true;

	static isInstance(error: unknown): error is OutputFileAccessDeniedError {
		// lambda-client bundles its own copy of this class.
		return (
			error instanceof Error &&
			outputFileAccessDenied in error &&
			error[outputFileAccessDenied] === true
		);
	}
}

export const findOutputFileInBucket = async <Provider extends CloudProvider>({
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
	const {renderBucketName, key} = getExpectedOutName({
		renderMetadata,
		bucketName,
		customCredentials,
		bucketNamePrefix: providerSpecifics.getBucketPrefix(),
		output,
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
				output,
			}).url,
			sizeInBytes: metadata.ContentLength ?? null,
		};
	} catch (err) {
		if ((err as Error).name === 'NotFound') {
			return null;
		}

		throw err;
	}
};
