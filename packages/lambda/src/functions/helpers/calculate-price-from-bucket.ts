import {type CloudProvider, type ParsedTiming} from '@remotion/serverless';
import type {RenderMetadata} from '@remotion/serverless/client';
import {calculateChunkTimes} from '@remotion/serverless/client';
import {estimatePrice} from '../../api/estimate-price';
import type {AwsRegion} from '../../regions';

export const estimatePriceFromBucket = <Provider extends CloudProvider>({
	renderMetadata,
	memorySizeInMb,
	diskSizeInMb,
	lambdasInvoked,
	timings,
	region,
}: {
	renderMetadata: RenderMetadata<Provider> | null;
	memorySizeInMb: number;
	diskSizeInMb: number;
	lambdasInvoked: number;
	timings: ParsedTiming[];
	region: AwsRegion;
}) => {
	if (!renderMetadata) {
		return null;
	}

	const elapsedTime = Math.max(
		0,
		Date.now() - (renderMetadata?.startedDate ?? 0),
	);
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
			region,
			durationInMilliseconds: estimatedBillingDurationInMilliseconds,
			memorySizeInMb,
			diskSizeInMb,
			lambdasInvoked,
		}).toPrecision(5),
	);

	return {accruedSoFar, estimatedBillingDurationInMilliseconds};
};
