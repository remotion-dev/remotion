import {REMOTION_BUCKET_PREFIX} from './constants';
import {getExpectedOutName} from './expected-out-name';
import {getOutputUrlFromMetadata} from './get-output-url-from-metadata';
import {lambdaHeadFileImplementation} from './head-file';
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
	forcePathStyle,
	requestHandler,
	output,
}: FindOutputFileInBucketInput): Promise<OutputFileMetadata | null> => {
	const {renderBucketName, key} = getExpectedOutName({
		renderMetadata,
		bucketName,
		customCredentials,
		bucketNamePrefix: REMOTION_BUCKET_PREFIX,
		output,
	});

	try {
		const metadata = await lambdaHeadFileImplementation({
			bucketName: renderBucketName,
			key,
			region,
			customCredentials,
			forcePathStyle,
			requestHandler,
		});

		return {
			url: getOutputUrlFromMetadata({
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
