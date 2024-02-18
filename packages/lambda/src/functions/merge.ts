import {RenderInternals} from '@remotion/renderer';
import type {LambdaPayload, PostRenderData} from '../defaults';
import {LambdaRoutines} from '../defaults';
import {getExpectedOutName} from './helpers/expected-out-name';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {getRenderMetadata} from './helpers/get-render-metadata';
import {mergeChunksAndFinishRender} from './helpers/merge-chunks';

type Options = {
	expectedBucketOwner: string;
};

export const mergeHandler = async (
	params: LambdaPayload,
	options: Options,
): Promise<{type: 'success'; postRenderData: PostRenderData}> => {
	if (params.type !== LambdaRoutines.merge) {
		throw new Error('Expected launch type');
	}

	RenderInternals.Log.infoAdvanced(
		{indent: false, logLevel: params.logLevel},
		'This function has been started because the previous main function has timed out while merging together the chunks.',
	);
	RenderInternals.Log.infoAdvanced(
		{indent: false, logLevel: params.logLevel},
		'The merging of chunks will now restart.',
	);

	const renderMetadata = await getRenderMetadata({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		renderId: params.renderId,
	});

	if (!renderMetadata.codec) {
		throw new Error('expected codec');
	}

	const {key, renderBucketName, customCredentials} = getExpectedOutName(
		renderMetadata,
		params.bucketName,
		typeof params.outName === 'string' || typeof params.outName === 'undefined'
			? null
			: params.outName?.s3OutputProvider ?? null,
	);

	const frameCount = RenderInternals.getFramesToRender(
		renderMetadata.frameRange,
		renderMetadata.everyNthFrame,
	);

	const fps = renderMetadata.videoConfig.fps / renderMetadata.everyNthFrame;

	const postRenderData = await mergeChunksAndFinishRender({
		audioCodec: renderMetadata.audioCodec,
		bucketName: params.bucketName,
		chunkCount: renderMetadata.totalChunks,
		codec: renderMetadata.codec,
		customCredentials,
		downloadBehavior: renderMetadata.downloadBehavior,
		expectedBucketOwner: options.expectedBucketOwner,
		fps,
		frameCountLength: frameCount.length,
		inputProps: params.inputProps,
		key,
		numberOfGifLoops: renderMetadata.numberOfGifLoops,
		privacy: renderMetadata.privacy,
		renderBucketName,
		renderId: params.renderId,
		renderMetadata,
		serializedResolvedProps: params.serializedResolvedProps,
		onAllChunks: () => {
			RenderInternals.Log.infoAdvanced(
				{indent: false, logLevel: params.logLevel},
				'All chunks have been downloaded now.',
			);
		},
		audioBitrate: renderMetadata.audioBitrate,
		logLevel: params.logLevel,
	});

	return {type: 'success' as const, postRenderData};
};
