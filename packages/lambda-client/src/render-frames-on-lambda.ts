import type {
	ImageSequenceOutputPrefix,
	ImageSequenceFormat,
} from '@remotion/serverless-client';
import {wrapWithErrorHandling} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {
	internalRenderMediaOnLambdaRaw,
	renderMediaOnLambdaOptionalToRequired,
	type RenderMediaOnLambdaInput,
	type RenderMediaOnLambdaOutput,
} from './render-media-on-lambda';

export type RenderFramesOnLambdaInput = Pick<
	RenderMediaOnLambdaInput,
	| 'region'
	| 'functionName'
	| 'serveUrl'
	| 'composition'
	| 'inputProps'
	| 'envVariables'
	| 'privacy'
	| 'jpegQuality'
	| 'maxRetries'
	| 'framesPerLambda'
	| 'concurrency'
	| 'frameRange'
	| 'chromiumOptions'
	| 'scale'
	| 'everyNthFrame'
	| 'concurrencyPerLambda'
	| 'downloadBehavior'
	| 'overwrite'
	| 'webhook'
	| 'forceWidth'
	| 'forceHeight'
	| 'forceFps'
	| 'forceDurationInFrames'
	| 'rendererFunctionName'
	| 'forceBucketName'
	| 'forcePathStyle'
	| 'storageClass'
	| 'requestHandler'
	| 'isProduction'
	| 'licenseKey'
	| 'logLevel'
	| 'timeoutInMilliseconds'
	| 'deleteAfter'
	| 'offthreadVideoCacheSizeInBytes'
	| 'offthreadVideoThreads'
	| 'mediaCacheSizeInBytes'
	| 'enableCancellation'
> & {
	imageFormat?: ImageSequenceFormat;
	outputPrefix?: ImageSequenceOutputPrefix<AwsProvider>;
	imageSequencePattern?: string;
};

export type RenderFramesOnLambdaOutput = RenderMediaOnLambdaOutput;

const wrapped = wrapWithErrorHandling(internalRenderMediaOnLambdaRaw);

/*
 * @description Starts a distributed image sequence render. Track progress using getRenderProgress().
 * @see [Documentation](https://remotion.dev/docs/lambda/renderframesonlambda)
 */
export const renderFramesOnLambda = (
	options: RenderFramesOnLambdaInput,
): Promise<RenderFramesOnLambdaOutput> => {
	if (
		Array.isArray(options.frameRange) &&
		Array.isArray(options.frameRange[0])
	) {
		throw new Error('Multiple frame ranges are not supported on Lambda.');
	}

	const imageFormat = options.imageFormat ?? 'png';
	if (imageFormat !== 'png' && imageFormat !== 'jpeg') {
		throw new TypeError('imageFormat must be "png" or "jpeg".');
	}

	if (options.jpegQuality !== undefined && imageFormat !== 'jpeg') {
		throw new TypeError(
			'jpegQuality can only be passed with imageFormat: "jpeg".',
		);
	}

	return wrapped({
		...renderMediaOnLambdaOptionalToRequired({
			...options,
			codec: null,
			imageFormat,
			muted: true,
		}),
		output: {
			type: 'sequence',
			outputPrefix: options.outputPrefix ?? null,
			imageSequencePattern: options.imageSequencePattern ?? null,
		},
	});
};
