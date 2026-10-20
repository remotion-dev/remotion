import fs from 'node:fs';
import type {StorageClass} from '@aws-sdk/client-s3';
import {
	LambdaClientInternals,
	type CustomCredentials,
	type PostRenderData,
	type Privacy,
	type RenderMetadata,
	type SerializedInputProps,
	type WriteFileInput,
	type RequestHandler,
} from '@remotion/lambda-client';
import type {LogLevel} from '@remotion/renderer';
import type {DownloadBehavior} from 'remotion/no-react';
import {cleanupProps} from './cleanup-props';
import {createPostRenderData} from './create-post-render-data';
import {getCurrentMemorySizeInMb} from './helpers/get-current-memory-size';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {timer} from './helpers/timer';
import type {OverallProgressHelper} from './overall-render-progress';

type FinishRenderInput = {
	expectedBucketOwner: string | null;
	renderBucketName: string;
	customCredentials: CustomCredentials | null;
	downloadBehavior: DownloadBehavior;
	key: string;
	privacy: Privacy;
	inputProps: SerializedInputProps;
	serializedResolvedProps: SerializedInputProps;
	renderMetadata: RenderMetadata;
	logLevel: LogLevel;
	overallProgress: OverallProgressHelper;
	startTime: number;
	forcePathStyle: boolean;
	storageClass: StorageClass | null;
	requestHandler: RequestHandler | null;
	outputFile: string;
	timeToCombine: number | null;
	bucketName: string;
	separateAudioFile: string | null;
	separateAudioCredentials: CustomCredentials | null;
};

export const finishRender = async ({
	expectedBucketOwner,
	renderBucketName,
	customCredentials,
	downloadBehavior,
	key,
	privacy,
	inputProps,
	serializedResolvedProps,
	renderMetadata,
	logLevel,
	overallProgress,
	startTime,
	forcePathStyle,
	storageClass,
	requestHandler,
	outputFile,
	timeToCombine,
	bucketName,
	separateAudioFile,
	separateAudioCredentials,
}: FinishRenderInput): Promise<PostRenderData> => {
	const outputSize = fs.statSync(outputFile).size;

	if (
		(renderMetadata.separateAudioTo ?? null) !== null &&
		separateAudioFile === null
	) {
		throw new Error('The separate audio output was not created.');
	}

	const separateAudioDestination =
		separateAudioFile === null
			? null
			: LambdaClientInternals.getExpectedOutName({
					output: 'separate-audio',
					renderMetadata,
					bucketName,
					customCredentials: separateAudioCredentials,
					bucketNamePrefix: LambdaClientInternals.REMOTION_BUCKET_PREFIX,
				});
	for (const file of [
		...(separateAudioFile === null || separateAudioDestination === null
			? []
			: [
					{
						output: 'separate-audio' as const,
						file: separateAudioFile,
						...separateAudioDestination,
						conditional: renderMetadata.separateAudioOutputFileIsConditional,
					},
				]),
		{
			output: 'main' as const,
			file: outputFile,
			key,
			renderBucketName,
			customCredentials,
			conditional: renderMetadata.outputFileIsConditional,
		},
	]) {
		const sizeInBytes = fs.statSync(file.file).size;
		const writeToBucket = timer(
			`Writing to bucket (${sizeInBytes} bytes)`,
			logLevel,
		);
		const body = fs.createReadStream(file.file);
		const writeOptions: WriteFileInput = {
			bucketName: file.renderBucketName,
			key: file.key,
			body,
			region: getCurrentRegionInFunction(),
			privacy,
			expectedBucketOwner,
			downloadBehavior:
				file.output === 'separate-audio' && downloadBehavior.type === 'download'
					? {...downloadBehavior, fileName: null}
					: downloadBehavior,
			customCredentials: file.customCredentials,
			forcePathStyle,
			storageClass,
			requestHandler,
			metadata: {'remotion-render-id': renderMetadata.renderId},
		};
		try {
			if (file.conditional) {
				await LambdaClientInternals.lambdaWriteFileIfNotExistsImplementation(
					writeOptions,
				);
			} else {
				await LambdaClientInternals.lambdaWriteFileImplementation(writeOptions);
			}
		} finally {
			body.destroy();
		}

		writeToBucket.end();
		if (file.output === 'separate-audio') {
			const {url} = LambdaClientInternals.getOutputUrlFromMetadata({
				output: 'separate-audio',
				bucketName,
				renderMetadata,
				customCredentials: file.customCredentials,
				currentRegion: getCurrentRegionInFunction(),
			});
			// Persist the audio upload before publishing the main file so progress
			// recovery cannot finish a render with a missing audio output.
			await overallProgress.setSeparateAudio({
				url,
				key: file.key,
				bucketName: file.renderBucketName,
				sizeInBytes,
			});
		}
	}

	const errorExplanations = LambdaClientInternals.inspectErrors({
		errors: overallProgress.get().errors,
	});

	const cleanupProm = cleanupProps({
		inputProps,
		serializedResolvedProps,
		forcePathStyle,
	});

	const {url: outputUrl} = LambdaClientInternals.getOutputUrlFromMetadata({
		output: 'main',
		bucketName: renderBucketName,
		currentRegion: getCurrentRegionInFunction(),
		customCredentials,
		renderMetadata,
	});

	const postRenderData = createPostRenderData({
		region: getCurrentRegionInFunction(),
		memorySizeInMb: getCurrentMemorySizeInMb(),
		renderMetadata,
		errorExplanations,
		timeToDelete: (await cleanupProm).reduce((a, b) => Math.max(a, b), 0),
		outputFile: {
			sizeInBytes: outputSize,
			url: outputUrl,
			renderId: renderMetadata.renderId,
		},
		outputSize,
		timeToCombine,
		overallProgress: overallProgress.get(),
		timeToFinish: Date.now() - startTime,
	});

	await overallProgress.setPostRenderData(postRenderData);

	fs.unlinkSync(outputFile);
	if (separateAudioFile !== null) {
		fs.unlinkSync(separateAudioFile);
	}

	return postRenderData;
};
