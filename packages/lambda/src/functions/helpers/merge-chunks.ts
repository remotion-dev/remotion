import type {AudioCodec, LogLevel} from '@remotion/renderer';
import fs from 'fs';
import type {CustomCredentials} from '../../shared/aws-clients';
import {
	cleanupSerializedInputProps,
	cleanupSerializedResolvedProps,
} from '../../shared/cleanup-serialized-input-props';
import type {
	PostRenderData,
	Privacy,
	RenderMetadata,
	SerializedInputProps,
} from '../../shared/constants';
import {initalizedMetadataKey, rendersPrefix} from '../../shared/constants';
import type {DownloadBehavior} from '../../shared/content-disposition-header';
import type {LambdaCodec} from '../../shared/validate-lambda-codec';
import {concatVideos} from './concat-videos';
import {createPostRenderData} from './create-post-render-data';
import {getCurrentRegionInFunction} from './get-current-region';
import {getOutputUrlFromMetadata} from './get-output-url-from-metadata';
import {inspectErrors} from './inspect-errors';
import {lambdaDeleteFile, lambdaLs, lambdaWriteFile} from './io';
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

	const outputSize = fs.statSync(outfile);

	const writeToS3 = timer(
		`Writing to S3 (${outputSize.size} bytes)`,
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

	const contents = await lambdaLs({
		bucketName: options.bucketName,
		prefix: rendersPrefix(options.renderId),
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
	});

	const errorExplanationsProm = inspectErrors({
		contents,
		renderId: options.renderId,
		bucket: options.bucketName,
		region: getCurrentRegionInFunction(),
		expectedBucketOwner: options.expectedBucketOwner,
	});

	const cleanupSerializedInputPropsProm = cleanupSerializedInputProps({
		bucketName: options.bucketName,
		region: getCurrentRegionInFunction(),
		serialized: options.inputProps,
	});
	const cleanupResolvedInputPropsProm = cleanupSerializedResolvedProps({
		bucketName: options.bucketName,
		region: getCurrentRegionInFunction(),
		serialized: options.serializedResolvedProps,
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
		contents,
		errorExplanations: await errorExplanationsProm,
		timeToEncode: encodingStop - encodingStart,
		timeToDelete: (
			await Promise.all([
				cleanupSerializedInputPropsProm,
				cleanupResolvedInputPropsProm,
			])
		).reduce((a, b) => a + b, 0),
		outputFile: {
			lastModified: Date.now(),
			size: outputSize.size,
			url: outputUrl,
		},
		timeToCombine: encodingStop - encodingStart,
		overallProgress: options.overallProgress.get(),
	});

	options.overallProgress.setPostRenderData(postRenderData);
	await lambdaDeleteFile({
		bucketName: options.bucketName,
		key: initalizedMetadataKey(options.renderId),
		region: getCurrentRegionInFunction(),
		customCredentials: null,
	});

	await Promise.all([cleanupChunksProm, fs.promises.rm(outfile)]);
	return postRenderData;
};
