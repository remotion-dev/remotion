import type {
	AudioCodec,
	CombineChunksOnProgress,
	LogLevel,
	SingleFrameRange,
} from '@remotion/renderer';
import type {DownloadBehavior} from '@remotion/serverless-client';
import {
	type CloudProvider,
	type CustomCredentials,
	type PostRenderData,
	type Privacy,
	type ProviderSpecifics,
	type RenderMetadata,
	type SerializedInputProps,
	type ServerlessCodec,
} from '@remotion/serverless-client';
import {concatVideos} from './concat-videos';
import {finishRender} from './finish-render';
import type {OverallProgressHelper} from './overall-render-progress';
import type {InsideFunctionSpecifics} from './provider-implementation';

export const mergeChunksAndFinishRender = async <
	Provider extends CloudProvider,
>(options: {
	bucketName: string;
	renderId: string;
	expectedBucketOwner: string;
	numberOfFrames: number;
	codec: ServerlessCodec;
	chunkCount: number;
	fps: number;
	numberOfGifLoops: number | null;
	audioCodec: AudioCodec | null;
	renderBucketName: string;
	customCredentials: CustomCredentials<Provider> | null;
	downloadBehavior: DownloadBehavior;
	key: string;
	privacy: Privacy;
	inputProps: SerializedInputProps;
	serializedResolvedProps: SerializedInputProps;
	renderMetadata: RenderMetadata<Provider>;
	audioBitrate: string | null;
	logLevel: LogLevel;
	framesPerLambda: number;
	binariesDirectory: string | null;
	preferLossless: boolean;
	compositionStart: number;
	outdir: string;
	files: string[];
	overallProgress: OverallProgressHelper<Provider>;
	startTime: number;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
	forcePathStyle: boolean;
	everyNthFrame: number;
	frameRange: SingleFrameRange | null;
	storageClass: Provider['storageClass'] | null;
	requestHandler: Provider['requestHandler'] | null;
	sampleRate: number;
}): Promise<PostRenderData<Provider>> => {
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

	const {outfile, cleanupChunksProm} = await concatVideos({
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
		insideFunctionSpecifics: options.insideFunctionSpecifics,
		compositionDurationInFrames: options.numberOfFrames,
		everyNthFrame: options.everyNthFrame,
		frameRange: options.frameRange,
		sampleRate: options.sampleRate,
	});
	const encodingStop = Date.now();
	options.overallProgress.setTimeToCombine(encodingStop - encodingStart);

	const postRenderData = await finishRender({
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
		providerSpecifics: options.providerSpecifics,
		insideFunctionSpecifics: options.insideFunctionSpecifics,
		forcePathStyle: options.forcePathStyle,
		storageClass: options.storageClass,
		requestHandler: options.requestHandler,
		outputFile: outfile,
		timeToCombine: encodingStop - encodingStart,
	});

	await cleanupChunksProm;
	return postRenderData;
};
