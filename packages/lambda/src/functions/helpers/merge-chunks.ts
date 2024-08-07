import type {AudioCodec, LogLevel} from '@remotion/renderer';
import type {CloudProvider, ProviderSpecifics} from '@remotion/serverless';
import type {
	CustomCredentials,
	DownloadBehavior,
	Privacy,
	RenderMetadata,
	SerializedInputProps,
	ServerlessCodec,
} from '@remotion/serverless/client';
import fs from 'fs';
import type {PostRenderData} from '../../shared/constants';
import {cleanupProps} from './cleanup-props';
import {concatVideos} from './concat-videos';
import {createPostRenderData} from './create-post-render-data';
import {getOutputUrlFromMetadata} from './get-output-url-from-metadata';
import {inspectErrors} from './inspect-errors';
import type {OverallProgressHelper} from './overall-render-progress';
import {timer} from './timer';

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
}): Promise<PostRenderData<Provider>> => {
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

	const writeToBucket = timer(
		`Writing to bucket (${outputSize} bytes)`,
		options.logLevel,
	);

	await options.providerSpecifics.writeFile({
		bucketName: options.renderBucketName,
		key: options.key,
		body: fs.createReadStream(outfile),
		region: options.providerSpecifics.getCurrentRegionInFunction(),
		privacy: options.privacy,
		expectedBucketOwner: options.expectedBucketOwner,
		downloadBehavior: options.downloadBehavior,
		customCredentials: options.customCredentials,
	});

	writeToBucket.end();

	const errorExplanations = inspectErrors({
		errors: options.overallProgress.get().errors,
	});

	const cleanupProm = cleanupProps({
		inputProps: options.inputProps,
		serializedResolvedProps: options.serializedResolvedProps,
		providerSpecifics: options.providerSpecifics,
	});

	const {url: outputUrl} = getOutputUrlFromMetadata(
		options.renderMetadata,
		options.bucketName,
		options.customCredentials,
		options.providerSpecifics.getCurrentRegionInFunction(),
	);

	const postRenderData = createPostRenderData({
		region: options.providerSpecifics.getCurrentRegionInFunction(),
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
