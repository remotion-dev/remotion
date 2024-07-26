import type {ProviderSpecifics} from '@remotion/serverless';
import {estimatePrice} from '../../api/estimate-price';
import type {AwsRegion} from '../../regions';
import type {RenderMetadata} from '../../shared/constants';
import type {ParsedTiming} from '../../shared/parse-lambda-timings-key';
import {calculateChunkTimes} from './calculate-chunk-times';

export const estimatePriceFromBucket = <Region extends string>({
	renderMetadata,
	memorySizeInMb,
	diskSizeInMb,
	lambdasInvoked,
	timings,
	providerSpecifics,
}: {
	renderMetadata: RenderMetadata | null;
	memorySizeInMb: number;
	diskSizeInMb: number;
	lambdasInvoked: number;
	timings: ParsedTiming[];
	providerSpecifics: ProviderSpecifics<Region>;
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
			region: providerSpecifics.getCurrentRegionInFunction() as AwsRegion,
			durationInMilliseconds: estimatedBillingDurationInMilliseconds,
			memorySizeInMb,
			diskSizeInMb,
			lambdasInvoked,
		}).toPrecision(5),
	);

	return {accruedSoFar, estimatedBillingDurationInMilliseconds};
};
