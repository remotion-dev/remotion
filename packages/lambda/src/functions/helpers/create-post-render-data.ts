import {estimatePrice} from '../../api/estimate-price';
import type {AwsRegion} from '../../regions';
import type {PostRenderData, RenderMetadata} from '../../shared/constants';
import {MAX_EPHEMERAL_STORAGE_IN_MB} from '../../shared/constants';
import {
	OVERHEAD_TIME_PER_LAMBDA,
	getMostExpensiveChunks,
} from '../../shared/get-most-expensive-chunks';
import {calculateChunkTimes} from './calculate-chunk-times';
import type {OutputFileMetadata} from './find-output-file-in-bucket';
import type {OverallRenderProgress} from './overall-render-progress';
import type {EnhancedErrorInfo} from './write-lambda-error';

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

	const estimatedBillingDurationInMilliseconds = parsedTimings
		.map((p) => p.rendered - p.start + OVERHEAD_TIME_PER_LAMBDA)
		.reduce((a, b) => a + b);

	const cost = estimatePrice({
		durationInMilliseconds: estimatedBillingDurationInMilliseconds,
		memorySizeInMb,
		region,
		lambdasInvoked: renderMetadata.estimatedTotalLambdaInvokations,
		// We cannot determine the ephemeral storage size, so we
		// overestimate the price, but will only have a miniscule effect (~0.2%)
		diskSizeInMb: MAX_EPHEMERAL_STORAGE_IN_MB,
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
				'Estimated cost for lambda invocations only. Does not include cost for S3 storage and data transfer.',
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
				: getMostExpensiveChunks(
						parsedTimings,
						renderMetadata.framesPerLambda,
						renderMetadata.frameRange[0],
						renderMetadata.frameRange[1],
					),
		deleteAfter: renderMetadata.deleteAfter,
		estimatedBillingDurationInMilliseconds,
		timeToCombine: timeToCombine ?? null,
		artifactProgress: overallProgress.receivedArtifact,
	};
};
