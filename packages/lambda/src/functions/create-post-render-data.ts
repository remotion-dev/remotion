import {
	LambdaClientInternals,
	type EnhancedErrorInfo,
	type OverallRenderProgress,
	type PostRenderData,
	type RenderMetadata,
	type AwsRegion,
} from '@remotion/lambda-client';
import type {OutputFileMetadata} from './find-output-file-in-bucket';

export const createPostRenderData = ({
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
}: {
	region: AwsRegion;
	memorySizeInMb: number;
	renderMetadata: RenderMetadata;
	timeToDelete: number;
	errorExplanations: EnhancedErrorInfo[];
	outputFile: OutputFileMetadata;
	timeToCombine: number | null;
	overallProgress: OverallRenderProgress;
	timeToFinish: number;
	outputSize: number;
}): PostRenderData => {
	const parsedTimings = overallProgress.timings;

	const estimatedBillingDurationInMilliseconds =
		LambdaClientInternals.calculateBillingDuration({
			timings: parsedTimings,
			functionsInvoked: parsedTimings.length,
			elapsedTimeOfUnfinishedChunks: 0,
		});

	const cost = LambdaClientInternals.estimatePrice({
		durationInMilliseconds: estimatedBillingDurationInMilliseconds,
		memorySizeInMb:
			LambdaClientInternals.parseFunctionName(
				renderMetadata.rendererFunctionName,
			)?.memorySizeInMb ?? memorySizeInMb,
		region,
		lambdasInvoked: renderMetadata.estimatedTotalLambdaInvokations,
		diskSizeInMb: LambdaClientInternals.MAX_EPHEMERAL_STORAGE_IN_MB,
	});

	if (!outputFile) {
		throw new Error('Cannot wrap up without an output file in the S3 bucket.');
	}

	const endTime = Date.now();
	const billingCurrency = LambdaClientInternals.getBillingCurrency(region);

	if (
		renderMetadata.type !== 'sequence' &&
		overallProgress.timeToEncode === null
	) {
		throw new Error('Expected time to encode to be set');
	}

	if (overallProgress.timeToRenderFrames === null) {
		throw new Error('Expected time to encode to be set');
	}

	return {
		cost: {
			currency: billingCurrency,
			disclaimer:
				'Estimated cost for function invocations only. Does not include cost for storage and data transfer.',
			estimatedCost: cost,
			estimatedDisplayCost: `${billingCurrency === 'CNY' ? '¥' : '$'}${new Intl.NumberFormat(
				'en-US',
				{
					currency: billingCurrency,
					currencyDisplay: 'narrowSymbol',
				},
			).format(cost)}`,
		},
		outputFile: renderMetadata.type === 'sequence' ? null : outputFile.url,
		separateAudio: overallProgress.separateAudio ?? null,
		outputSequence:
			renderMetadata.type === 'sequence' ? renderMetadata.outputSequence : null,
		timeToFinish,
		errors: errorExplanations,
		startTime: renderMetadata.startedDate,
		endTime,
		outputSize,
		renderSize: outputSize,
		filesCleanedUp: 0,
		timeToEncode: overallProgress.timeToEncode,
		timeToCleanUp: timeToDelete,
		timeToRenderChunks: LambdaClientInternals.calculateChunkTimes({
			type: 'absolute-time',
			timings: overallProgress.timings,
		}),
		timeToRenderFrames: overallProgress.timeToRenderFrames,
		retriesInfo: overallProgress.retries,
		mostExpensiveFrameRanges:
			renderMetadata.type === 'still'
				? []
				: LambdaClientInternals.getMostExpensiveChunks({
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
