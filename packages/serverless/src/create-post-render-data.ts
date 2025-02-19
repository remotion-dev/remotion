import type {
	CloudProvider,
	EnhancedErrorInfo,
	OverallRenderProgress,
	PostRenderData,
	ProviderSpecifics,
	RenderMetadata,
} from '@remotion/serverless-client';
import {
	calculateChunkTimes,
	getMostExpensiveChunks,
	OVERHEAD_TIME_PER_LAMBDA,
} from '@remotion/serverless-client';
import type {OutputFileMetadata} from './find-output-file-in-bucket';

export const createPostRenderData = <Provider extends CloudProvider>({
	region,
	memorySizeInMb,
	renderMetadata,
	errorExplanations,
	timeToDelete,
	outputFile,
	timeToCombine,
	overallProgress,
	timeToFinish,
	outputSize,
	providerSpecifics,
}: {
	region: Provider['region'];
	memorySizeInMb: number;
	renderMetadata: RenderMetadata<Provider>;
	timeToDelete: number;
	errorExplanations: EnhancedErrorInfo[];
	outputFile: OutputFileMetadata;
	timeToCombine: number | null;
	overallProgress: OverallRenderProgress<Provider>;
	timeToFinish: number;
	outputSize: number;
	providerSpecifics: ProviderSpecifics<Provider>;
}): PostRenderData<Provider> => {
	const parsedTimings = overallProgress.timings;

	const estimatedBillingDurationInMilliseconds = parsedTimings
		.map((p) => p.rendered - p.start + OVERHEAD_TIME_PER_LAMBDA)
		.reduce((a, b) => a + b);

	const cost = providerSpecifics.estimatePrice({
		durationInMilliseconds: estimatedBillingDurationInMilliseconds,
		memorySizeInMb:
			providerSpecifics.parseFunctionName(renderMetadata.rendererFunctionName)
				?.memorySizeInMb ?? memorySizeInMb,
		region,
		lambdasInvoked: renderMetadata.estimatedTotalLambdaInvokations,
		diskSizeInMb: providerSpecifics.getEphemeralStorageForPriceCalculation(),
	});

	if (!outputFile) {
		throw new Error('Cannot wrap up without an output file in the S3 bucket.');
	}

	const endTime = Date.now();

	if (overallProgress.timeToEncode === null) {
		throw new Error('Expected time to encode to be set');
	}

	if (overallProgress.timeToRenderFrames === null) {
		throw new Error('Expected time to encode to be set');
	}

	return {
		cost: {
			currency: 'USD',
			disclaimer:
				'Estimated cost for function invocations only. Does not include cost for storage and data transfer.',
			estimatedCost: cost,
			estimatedDisplayCost: `$${new Intl.NumberFormat('en-US', {
				currency: 'USD',
				currencyDisplay: 'narrowSymbol',
			}).format(cost)}`,
		},
		outputFile: outputFile.url,
		timeToFinish,
		errors: errorExplanations,
		startTime: renderMetadata.startedDate,
		endTime,
		outputSize,
		renderSize: outputSize,
		filesCleanedUp: 0,
		timeToEncode: overallProgress.timeToEncode,
		timeToCleanUp: timeToDelete,
		timeToRenderChunks: calculateChunkTimes({
			type: 'absolute-time',
			timings: overallProgress.timings,
		}),
		timeToRenderFrames: overallProgress.timeToRenderFrames,
		retriesInfo: overallProgress.retries,
		mostExpensiveFrameRanges:
			renderMetadata.type === 'still'
				? []
				: getMostExpensiveChunks({
						parsedTimings,
						framesPerFunction: renderMetadata.framesPerLambda,
						firstFrame: renderMetadata.frameRange[0],
						lastFrame: renderMetadata.frameRange[1],
					}),
		deleteAfter: renderMetadata.deleteAfter,
		estimatedBillingDurationInMilliseconds,
		timeToCombine: timeToCombine ?? null,
		artifactProgress: overallProgress.receivedArtifact,
	};
};
