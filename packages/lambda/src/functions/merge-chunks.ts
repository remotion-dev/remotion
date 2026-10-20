import {rm} from 'node:fs/promises';
import {dirname} from 'node:path';
import type {StorageClass} from '@aws-sdk/client-s3';
import type {
	CustomCredentials,
	PostRenderData,
	Privacy,
	RenderMetadata,
	SerializedInputProps,
	ServerlessCodec,
	RequestHandler,
} from '@remotion/lambda-client';
import type {
	AudioCodec,
	CombineChunksOnProgress,
	LogLevel,
	SingleFrameRange,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {DownloadBehavior} from 'remotion/no-react';
import {concatVideos} from './concat-videos';
import {finishRender} from './finish-render';
import type {OverallProgressHelper} from './overall-render-progress';

type MergeChunksAndFinishRenderInput = {
	bucketName: string;
	renderId: string;
	expectedBucketOwner: string | null;
	numberOfFrames: number;
	codec: ServerlessCodec;
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
	forcePathStyle: boolean;
	everyNthFrame: number;
	frameRange: SingleFrameRange | null;
	storageClass: StorageClass | null;
	requestHandler: RequestHandler | null;
	sampleRate: number;
	separateAudioFilename: string | null;
	separateAudioCredentials: CustomCredentials | null;
};

export const mergeChunksAndFinishRender = async (
	options: MergeChunksAndFinishRenderInput,
): Promise<PostRenderData> => {
	const onProgress: CombineChunksOnProgress = ({frames: framesEncoded}) => {
		options.overallProgress.setCombinedFrames(framesEncoded);
	};

	const encodingStart = Date.now();
	if (options.renderMetadata.type === 'still') {
		throw new Error('Cannot merge stills');
	}

	if (options.files.length === 0) {
		throw new Error('No files to merge');
	}

	const {outfile, separateAudioFile, cleanupChunksProm} = await concatVideos({
		separateAudioFilename: options.separateAudioFilename,
		onProgress,
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
		metadata: options.renderMetadata.metadata,
		compositionDurationInFrames: options.numberOfFrames,
		everyNthFrame: options.everyNthFrame,
		frameRange: options.frameRange,
		sampleRate: options.sampleRate,
		outputExtension: RenderInternals.getExtensionOfFilename(options.key),
	});
	const encodingStop = Date.now();
	options.overallProgress.setTimeToCombine(encodingStop - encodingStart);

	try {
		return await finishRender({
			bucketName: options.bucketName,
			separateAudioFile,
			separateAudioCredentials: options.separateAudioCredentials,
			expectedBucketOwner: options.expectedBucketOwner,
			renderBucketName: options.renderBucketName,
			customCredentials: options.customCredentials,
			downloadBehavior: options.downloadBehavior,
			key: options.key,
			privacy: options.privacy,
			inputProps: options.inputProps,
			serializedResolvedProps: options.serializedResolvedProps,
			renderMetadata: options.renderMetadata,
			logLevel: options.logLevel,
			overallProgress: options.overallProgress,
			startTime: options.startTime,
			forcePathStyle: options.forcePathStyle,
			storageClass: options.storageClass,
			requestHandler: options.requestHandler,
			outputFile: outfile,
			timeToCombine: encodingStop - encodingStart,
		});
	} finally {
		await cleanupChunksProm;
		await rm(dirname(outfile), {recursive: true, force: true});
	}
};
