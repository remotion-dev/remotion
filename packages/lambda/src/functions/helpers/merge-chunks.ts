import type {AudioCodec, LogLevel} from '@remotion/renderer';
import type {
	CustomCredentials,
	DownloadBehavior,
	LambdaCodec,
	Privacy,
	SerializedInputProps,
} from '@remotion/serverless/client';
import fs from 'fs';
import type {PostRenderData, RenderMetadata} from '../../shared/constants';
import {cleanupProps} from './cleanup-props';
import {concatVideos} from './concat-videos';
import {createPostRenderData} from './create-post-render-data';
import {getCurrentRegionInFunction} from './get-current-region';
import {getOutputUrlFromMetadata} from './get-output-url-from-metadata';
import {inspectErrors} from './inspect-errors';
import {lambdaWriteFile} from './io';
import type {OverallProgressHelper} from './overall-render-progress';
import {timer} from './timer';

export const mergeChunksAndFinishRender = async (options: {
	bucketName: string;
	renderId: string;
	expectedBucketOwner: string;
	numberOfFrames: number;
	codec: LambdaCodec;
	chunkCount: number;
	fps: number;
	numberOfGifLoops: number | null;
	audioCodec: AudioCodec | null;
	renderBucketName: string;
	customCredentials: CustomCredentials | null;
	downloadBehavior: DownloadBehavior;
	key: string;
	privacy: Privacy;
	inputProps: SerializedInputProps;
	serializedResolvedProps: SerializedInputProps;
	renderMetadata: RenderMetadata;
	audioBitrate: string | null;
	logLevel: LogLevel;
	framesPerLambda: number;
	binariesDirectory: string | null;
	preferLossless: boolean;
	compositionStart: number;
	outdir: string;
	files: string[];
	overallProgress: OverallProgressHelper;
	startTime: number;
}): Promise<PostRenderData> => {
	const onProgress = (framesEncoded: number) => {
		options.overallProgress.setCombinedFrames(framesEncoded);
	};

	const encodingStart = Date.now();
	if (options.renderMetadata.type === 'still') {
		throw new Error('Cannot merge stills');
	}

	const {outfile, cleanupChunksProm} = await concatVideos({
		onProgress,
		numberOfFrames: options.numberOfFrames,
		codec: options.codec,
		fps: options.fps,
		numberOfGifLoops: options.numberOfGifLoops,
		files: options.files,
		outdir: options.outdir,
		audioCodec: options.audioCodec,
		audioBitrate: options.audioBitrate,
		logLevel: options.logLevel,
		framesPerLambda: options.framesPerLambda,
		binariesDirectory: options.binariesDirectory,
		cancelSignal: undefined,
		preferLossless: options.preferLossless,
		muted: options.renderMetadata.muted,
	});
	const encodingStop = Date.now();
	options.overallProgress.setTimeToCombine(encodingStop - encodingStart);

	const outputSize = fs.statSync(outfile).size;

	const writeToS3 = timer(
		`Writing to S3 (${outputSize} bytes)`,
		options.logLevel,
	);

	await lambdaWriteFile({
		bucketName: options.renderBucketName,
		key: options.key,
		body: fs.createReadStream(outfile),
		region: getCurrentRegionInFunction(),
		privacy: options.privacy,
		expectedBucketOwner: options.expectedBucketOwner,
		downloadBehavior: options.downloadBehavior,
		customCredentials: options.customCredentials,
	});

	writeToS3.end();

	const errorExplanations = inspectErrors({
		errors: options.overallProgress.get().errors,
	});

	const cleanupProm = cleanupProps({
		inputProps: options.inputProps,
		serializedResolvedProps: options.serializedResolvedProps,
	});

	const {url: outputUrl} = getOutputUrlFromMetadata(
		options.renderMetadata,
		options.bucketName,
		options.customCredentials,
	);

	const postRenderData = createPostRenderData({
		region: getCurrentRegionInFunction(),
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		renderMetadata: options.renderMetadata,
		errorExplanations,
		timeToDelete: (await cleanupProm).reduce((a, b) => Math.max(a, b), 0),
		outputFile: {
			url: outputUrl,
		},
		outputSize,
		timeToCombine: encodingStop - encodingStart,
		overallProgress: options.overallProgress.get(),
		timeToFinish: Date.now() - options.startTime,
	});

	options.overallProgress.setPostRenderData(postRenderData);

	await Promise.all([cleanupChunksProm, fs.promises.rm(outfile)]);
	return postRenderData;
};
