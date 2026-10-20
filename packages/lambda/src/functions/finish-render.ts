import fs from 'node:fs';
import type {StorageClass} from '@aws-sdk/client-s3';
import {
	LambdaClientInternals,
	type CustomCredentials,
	type PostRenderData,
	type Privacy,
	type ProviderSpecifics,
	type RenderMetadata,
	type SerializedInputProps,
	type WriteFileInput,
	type RequestHandler,
} from '@remotion/lambda-client';
import type {LogLevel} from '@remotion/renderer';
import type {DownloadBehavior} from 'remotion/no-react';
import {cleanupProps} from './cleanup-props';
import {createPostRenderData} from './create-post-render-data';
import type {OverallProgressHelper} from './overall-render-progress';
import type {InsideFunctionSpecifics} from './provider-implementation';

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
	providerSpecifics: ProviderSpecifics;
	insideFunctionSpecifics: InsideFunctionSpecifics;
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
	providerSpecifics,
	insideFunctionSpecifics,
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
					bucketNamePrefix: providerSpecifics.getBucketPrefix(),
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
		const writeToBucket = insideFunctionSpecifics.timer(
			`Writing to bucket (${sizeInBytes} bytes)`,
			logLevel,
		);
		const body = fs.createReadStream(file.file);
		const writeOptions: WriteFileInput = {
			bucketName: file.renderBucketName,
			key: file.key,
			body,
			region: insideFunctionSpecifics.getCurrentRegionInFunction(),
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
				if (providerSpecifics.writeFileIfNotExists === null) {
					throw new Error(
						'The provider does not support conditional output uploads',
					);
				}

				await providerSpecifics.writeFileIfNotExists(writeOptions);
			} else {
				await providerSpecifics.writeFile(writeOptions);
			}
		} finally {
			body.destroy();
		}

		writeToBucket.end();
		if (file.output === 'separate-audio') {
			const {url} = providerSpecifics.getOutputUrl({
				output: 'separate-audio',
				bucketName,
				renderMetadata,
				customCredentials: file.customCredentials,
				currentRegion: insideFunctionSpecifics.getCurrentRegionInFunction(),
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
		providerSpecifics,
		forcePathStyle,
		insideFunctionSpecifics,
	});

	const {url: outputUrl} = providerSpecifics.getOutputUrl({
		output: 'main',
		bucketName: renderBucketName,
		currentRegion: insideFunctionSpecifics.getCurrentRegionInFunction(),
		customCredentials,
		renderMetadata,
	});

	const postRenderData = createPostRenderData({
		region: insideFunctionSpecifics.getCurrentRegionInFunction(),
		memorySizeInMb: insideFunctionSpecifics.getCurrentMemorySizeInMb(),
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
		providerSpecifics,
	});

	await overallProgress.setPostRenderData(postRenderData);

	fs.unlinkSync(outputFile);
	if (separateAudioFile !== null) {
		fs.unlinkSync(separateAudioFile);
	}

	return postRenderData;
};
