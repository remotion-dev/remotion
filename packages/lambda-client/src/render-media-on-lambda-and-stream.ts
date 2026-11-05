import type {RenderProgress} from './constants';
import {
	renderMediaOnLambdaOptionalToRequired,
	validateRenderMediaOnLambdaInput,
	type RenderMediaOnLambdaInput,
	type RenderMediaOnLambdaOutput,
} from './render-media-on-lambda';
import {
	internalRenderOnLambdaAndStream,
	type RenderMediaOnLambdaAndStreamOutput,
} from './render-on-lambda-and-stream';

export {
	RenderMediaOnLambdaAndStreamError,
	type RenderMediaOnLambdaAndStreamOutput,
} from './render-on-lambda-and-stream';

export type RenderMediaOnLambdaAndStreamInput = RenderMediaOnLambdaInput & {
	onInit?: (render: RenderMediaOnLambdaOutput) => void | Promise<void>;
	onProgress?: (progress: RenderProgress) => void | Promise<void>;
};

/**
 * Starts a media render on AWS Lambda, streams progress, and waits for the render to finish.
 * Callback failures stop observation without cancelling the server-side render.
 * @see https://www.remotion.dev/docs/lambda/rendermediaonlambdaandstream
 */
export const renderMediaOnLambdaAndStream = async (
	options: RenderMediaOnLambdaAndStreamInput,
): Promise<RenderMediaOnLambdaAndStreamOutput> => {
	validateRenderMediaOnLambdaInput(options);
	return internalRenderOnLambdaAndStream(
		renderMediaOnLambdaOptionalToRequired(options),
		{onInit: options.onInit ?? null, onProgress: options.onProgress ?? null},
	);
};
