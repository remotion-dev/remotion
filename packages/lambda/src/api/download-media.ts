import type {AwsRegion} from '@remotion/lambda-client';
import {LambdaClientInternals, type AwsProvider} from '@remotion/lambda-client';
import {REMOTION_BUCKET_PREFIX} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {ProviderSpecifics} from '@remotion/serverless';
import {
	getExpectedOutName,
	getOverallProgressFromStorage,
	type CustomCredentials,
} from '@remotion/serverless';
import path from 'node:path';
import type {LambdaReadFileProgress} from '../functions/helpers/read-with-progress';
import {lambdaDownloadFileWithProgress} from '../functions/helpers/read-with-progress';

export type DownloadMediaInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	outPath: string;
	onProgress?: LambdaReadFileProgress;
	customCredentials?: CustomCredentials<AwsProvider>;
	logLevel?: LogLevel;
	forcePathStyle?: boolean;
};

export type DownloadMediaOutput = {
	outputPath: string;
	sizeInBytes: number;
};

export const internalDownloadMedia = async (
	input: DownloadMediaInput & {
		providerSpecifics: ProviderSpecifics<AwsProvider>;
		forcePathStyle: boolean;
	},
): Promise<DownloadMediaOutput> => {
	const expectedBucketOwner = await input.providerSpecifics.getAccountId({
		region: input.region,
	});
	const overallProgress = await getOverallProgressFromStorage({
		bucketName: input.bucketName,
		expectedBucketOwner,
		region: input.region,
		renderId: input.renderId,
		providerSpecifics: input.providerSpecifics,
		forcePathStyle: input.forcePathStyle,
	});

	if (!overallProgress.renderMetadata) {
		throw new Error('Render did not finish yet');
	}

	const outputPath = path.resolve(process.cwd(), input.outPath);
	RenderInternals.ensureOutputDirectory(outputPath);

	const {key, renderBucketName, customCredentials} = getExpectedOutName({
		renderMetadata: overallProgress.renderMetadata,
		bucketName: input.bucketName,
		customCredentials: input.customCredentials ?? null,
		bucketNamePrefix: REMOTION_BUCKET_PREFIX,
	});

	const {sizeInBytes} = await lambdaDownloadFileWithProgress({
		bucketName: renderBucketName,
		expectedBucketOwner,
		key,
		region: input.region,
		onProgress: input.onProgress ?? (() => undefined),
		outputPath,
		customCredentials,
		logLevel: input.logLevel ?? 'info',
		forcePathStyle: input.forcePathStyle ?? false,
	});

	return {
		outputPath,
		sizeInBytes,
	};
};

/*
 * @description Downloads a rendered video, audio or still to the disk of the machine this API is called from.
 * @see [Documentation](https://remotion.dev/docs/lambda/downloadmedia)
 */

export const downloadMedia = (
	input: DownloadMediaInput,
): Promise<DownloadMediaOutput> => {
	return internalDownloadMedia({
		...input,
		providerSpecifics: LambdaClientInternals.awsImplementation,
		forcePathStyle: false,
	});
};
