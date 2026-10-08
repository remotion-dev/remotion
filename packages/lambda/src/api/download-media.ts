import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import type {AwsRegion, RequestHandler} from '@remotion/lambda-client';
import {LambdaClientInternals, type AwsProvider} from '@remotion/lambda-client';
import {REMOTION_BUCKET_PREFIX} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {ProviderSpecifics} from '@remotion/serverless';
import {
	getExpectedOutName,
	getImageSequenceFrameKey,
	getOverallProgressFromStorage,
	type CustomCredentials,
	type RenderOutput,
} from '@remotion/serverless';
import type {LambdaReadFileProgress} from '../functions/helpers/read-with-progress';
import {lambdaDownloadFileWithProgress} from '../functions/helpers/read-with-progress';

type InternalDownloadMediaInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	outPath: string;
	onProgress: LambdaReadFileProgress;
	customCredentials: CustomCredentials<AwsProvider> | null;
	logLevel: LogLevel;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
	signal: AbortSignal;
	output: RenderOutput;
};

export type DownloadMediaInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	outPath: string;
	onProgress?: LambdaReadFileProgress;
	customCredentials?: CustomCredentials<AwsProvider>;
	logLevel?: LogLevel;
	forcePathStyle?: boolean;
	requestHandler?: RequestHandler;
	signal?: AbortSignal;
	output?: RenderOutput;
};

export type DownloadMediaOutput = {
	outputPath: string;
	sizeInBytes: number;
};

export const internalDownloadMedia = async (
	input: InternalDownloadMediaInput & {
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
		requestHandler: input.requestHandler,
	});

	if (!overallProgress.renderMetadata) {
		throw new Error('Render did not finish yet');
	}

	const outputPath = path.resolve(process.cwd(), input.outPath);
	if (overallProgress.renderMetadata.type === 'sequence') {
		const metadata = overallProgress.renderMetadata;
		if (!overallProgress.postRenderData?.outputSequence) {
			throw new Error('The image sequence has not finished uploading');
		}

		const expectedSize = overallProgress.postRenderData.outputSize;
		const sequence = metadata.outputSequence;
		const frames = RenderInternals.getFramesToRender(
			metadata.frameRange,
			metadata.everyNthFrame,
		);
		const keys = [
			...frames.map((frame) =>
				getImageSequenceFrameKey({
					frame,
					keyPrefix: sequence.keyPrefix,
					imageFormat: sequence.imageFormat,
					imageSequencePattern: metadata.imageSequencePattern,
					framePadding: metadata.framePadding,
				}),
			),
			sequence.manifestKey,
		];
		await mkdir(outputPath, {recursive: true});
		const downloaded = new Map<string, number>();
		let totalSize = 0;
		const limit = LambdaClientInternals.pLimit(5);
		await Promise.all(
			keys.map((storageKey) =>
				limit(async () => {
					const result = await lambdaDownloadFileWithProgress({
						bucketName: sequence.bucketName,
						key: storageKey,
						expectedBucketOwner,
						region: input.region,
						outputPath: path.join(
							outputPath,
							storageKey.slice(sequence.keyPrefix.length),
						),
						customCredentials: input.customCredentials,
						logLevel: input.logLevel,
						forcePathStyle: input.forcePathStyle,
						requestHandler: input.requestHandler ?? undefined,
						abortSignal: input.signal,
						onProgress: ({downloaded: bytes}) => {
							downloaded.set(storageKey, bytes);
							const bytesDownloaded = [...downloaded.values()].reduce(
								(sum, size) => sum + size,
								0,
							);
							input.onProgress({
								downloaded: bytesDownloaded,
								totalSize: expectedSize,
								percent:
									expectedSize === 0
										? 1
										: Math.min(1, bytesDownloaded / expectedSize),
							});
						},
					});
					totalSize += result.sizeInBytes;
				}),
			),
		);
		return {outputPath, sizeInBytes: totalSize};
	}

	RenderInternals.ensureOutputDirectory(outputPath);

	const {key, renderBucketName, customCredentials} = getExpectedOutName({
		output: input.output,
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
		requestHandler: input.requestHandler ?? undefined,
		abortSignal: input.signal,
	});

	return {
		outputPath,
		sizeInBytes,
	};
};

/*
 * @description Downloads a rendered video, audio, still or image sequence to the disk of the machine this API is called from.
 * @see [Documentation](https://remotion.dev/docs/lambda/downloadmedia)
 */

export const downloadMedia = (
	input: DownloadMediaInput,
): Promise<DownloadMediaOutput> => {
	if (
		input.output !== undefined &&
		input.output !== 'main' &&
		input.output !== 'separate-audio'
	) {
		throw new Error('`output` must be "main" or "separate-audio".');
	}

	return internalDownloadMedia({
		...input,
		providerSpecifics: LambdaClientInternals.awsImplementation,
		output: input.output ?? 'main',
		forcePathStyle: false,
		onProgress: input.onProgress ?? (() => undefined),
		logLevel: input.logLevel ?? 'info',
		customCredentials: input.customCredentials ?? null,
		signal: input.signal ?? new AbortController().signal,
		requestHandler: input.requestHandler ?? null,
	});
};
