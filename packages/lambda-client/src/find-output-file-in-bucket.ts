import {getExpectedOutName} from './expected-out-name';
import type {ProviderSpecifics} from './provider-implementation';
import type {AwsRegion} from './regions';
import type {RenderMetadata} from './render-metadata';
import type {CustomCredentials, RenderOutput} from './shared-constants';
import type {RequestHandler} from './types';

export type OutputFileMetadata = {
	url: string;
	sizeInBytes: number | null;
	renderId: string | null;
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

export const findOutputFileInBucket = async ({
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
			renderId: metadata.Metadata?.['remotion-render-id'] ?? null,
		};
	} catch (err) {
		if ((err as Error).name === 'NotFound') {
			return null;
		}

		throw err;
	}
};
