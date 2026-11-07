import type {RenderProgress} from './constants';
import {
	renderFramesOnLambdaOptionalToRequired,
	type RenderFramesOnLambdaInput,
	type RenderFramesOnLambdaOutput,
} from './render-frames-on-lambda';
import {
	internalRenderOnLambdaAndStream,
	type RenderFramesOnLambdaAndStreamOutput,
} from './render-on-lambda-and-stream';

export {
	RenderFramesOnLambdaAndStreamError,
	type RenderFramesOnLambdaAndStreamOutput,
} from './render-on-lambda-and-stream';

export type RenderFramesOnLambdaAndStreamInput = RenderFramesOnLambdaInput & {
	onInit?: (render: RenderFramesOnLambdaOutput) => void | Promise<void>;
	onProgress?: (progress: RenderProgress) => void | Promise<void>;
};

/**
 * Starts an image sequence render on AWS Lambda, streams progress, and waits for the render to finish.
 * Callback failures stop observation without cancelling the server-side render.
 * @see https://www.remotion.dev/docs/lambda/renderframesonlambdaandstream
 */
export const renderFramesOnLambdaAndStream = async (
	options: RenderFramesOnLambdaAndStreamInput,
): Promise<RenderFramesOnLambdaAndStreamOutput> => {
	return internalRenderOnLambdaAndStream(
		renderFramesOnLambdaOptionalToRequired(options),
		{onInit: options.onInit ?? null, onProgress: options.onProgress ?? null},
	);
};
