import {RenderInternals} from '@remotion/renderer';
import type {LambdaPayload, PostRenderData} from '../defaults';
import {LambdaRoutines} from '../defaults';
import {mergeChunksAndFinishRender} from './helpers/merge-chunks';

type Options = {
	expectedBucketOwner: string;
};

export const mergeHandler = async (
	params: LambdaPayload,
	options: Options,
): Promise<PostRenderData> => {
	if (params.type !== LambdaRoutines.merge) {
		throw new Error('Expected launch type');
	}

	RenderInternals.Log.info(
		'This function has been started because the previous main function has timed out while merging together the chunks.',
	);
	RenderInternals.Log.info('The merging of chunks will now restart.');

	const postRenderData = await mergeChunksAndFinishRender({
		audioCodec: params.audioCodec,
		bucketName: params.bucketName,
		chunkCount: params.chunkCount,
		codec: params.codec,
		customCredentials: params.customCredentials,
		downloadBehavior: params.downloadBehavior,
		expectedBucketOwner: options.expectedBucketOwner,
		fps: params.fps,
		frameCountLength: params.frameCountLength,
		inputProps: params.inputProps,
		key: params.key,
		numberOfGifLoops: params.numberOfGifLoops,
		privacy: params.privacy,
		renderBucketName: params.renderBucketName,
		renderId: params.renderId,
		renderMetadata: params.renderMetadata,
		serializedResolvedProps: params.serializedResolvedProps,
		verbose: params.verbose,
	});

	return postRenderData;
};
