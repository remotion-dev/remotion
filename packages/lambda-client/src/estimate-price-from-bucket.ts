import {calculateBillingDuration} from './calculate-billing-duration';
import {estimatePrice} from './estimate-price';
import type {AwsRegion} from './regions';
import type {RenderMetadata} from './render-metadata';
import type {ParsedTiming} from './types';

export const estimatePriceFromMetadata = ({
	renderMetadata,
	memorySizeInMb,
	diskSizeInMb,
	functionsInvoked,
	timings,
	region,
	fatalErrorTimestamp,
}: {
	renderMetadata: RenderMetadata | null;
	memorySizeInMb: number;
	diskSizeInMb: number;
	functionsInvoked: number;
	timings: ParsedTiming[];
	region: AwsRegion;
	fatalErrorTimestamp: number | null;
}) => {
	if (!renderMetadata) {
		return null;
	}

	const now = fatalErrorTimestamp ?? Date.now();
	const elapsedTime = Math.max(0, now - (renderMetadata?.startedDate ?? 0));

	const estimatedBillingDurationInMilliseconds = calculateBillingDuration({
		timings,
		functionsInvoked,
		elapsedTimeOfUnfinishedChunks: elapsedTime,
	});

	const accruedSoFar = Number(
		estimatePrice({
			region,
			durationInMilliseconds: estimatedBillingDurationInMilliseconds,
			memorySizeInMb,
			diskSizeInMb,
			lambdasInvoked: functionsInvoked,
		}).toPrecision(5),
	);

	return {accruedSoFar, estimatedBillingDurationInMilliseconds};
};
