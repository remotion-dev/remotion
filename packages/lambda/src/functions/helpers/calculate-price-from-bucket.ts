import {estimatePrice} from '../../api/estimate-price';
import type {RenderMetadata} from '../../shared/constants';
import type {ParsedTiming} from '../../shared/parse-lambda-timings-key';
import {calculateChunkTimes} from './calculate-chunk-times';
import type {OutputFileMetadata} from './find-output-file-in-bucket';
import {getCurrentRegionInFunction} from './get-current-region';
import {getTimeToFinish} from './get-time-to-finish';

export const estimatePriceFromBucket = ({
	renderMetadata,
	memorySizeInMb,
	outputFileMetadata,
	diskSizeInMb,
	lambdasInvoked,
	timings,
}: {
	renderMetadata: RenderMetadata | null;
	memorySizeInMb: number;
	outputFileMetadata: OutputFileMetadata | null;
	diskSizeInMb: number;
	lambdasInvoked: number;
	timings: ParsedTiming[];
}) => {
	if (!renderMetadata) {
		return null;
	}

	const timeToFinish = getTimeToFinish({
		lastModified: outputFileMetadata?.lastModified ?? null,
		renderMetadata,
	});

	const elapsedTime =
		timeToFinish === null
			? Math.max(0, Date.now() - (renderMetadata?.startedDate ?? 0))
			: timeToFinish;

	const unfinished = Math.max(
		0,
		(renderMetadata?.totalChunks ?? 0) - timings.length,
	);
	const timeElapsedOfUnfinished = new Array(unfinished)
		.fill(true)
		.map(() => elapsedTime)
		.reduce((a, b) => a + b, 0);

	const estimatedBillingDurationInMilliseconds =
		calculateChunkTimes({
			type: 'combined-time-for-cost-calculation',
			timings,
		}) + timeElapsedOfUnfinished;

	const accruedSoFar = Number(
		estimatePrice({
			region: getCurrentRegionInFunction(),
			durationInMilliseconds: estimatedBillingDurationInMilliseconds,
			memorySizeInMb,
			diskSizeInMb,
			lambdasInvoked,
		}).toPrecision(5),
	);

	return {accruedSoFar, estimatedBillingDurationInMilliseconds};
};
