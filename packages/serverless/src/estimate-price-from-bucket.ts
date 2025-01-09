import {calculateChunkTimes} from './calculate-chunk-times';
import type {ProviderSpecifics} from './provider-implementation';
import type {RenderMetadata} from './render-metadata';
import type {CloudProvider, ParsedTiming} from './types';

export const estimatePriceFromMetadata = <Provider extends CloudProvider>({
	renderMetadata,
	memorySizeInMb,
	diskSizeInMb,
	functionsInvoked,
	timings,
	region,
	providerSpecifics,
}: {
	renderMetadata: RenderMetadata<Provider> | null;
	memorySizeInMb: number;
	diskSizeInMb: number;
	functionsInvoked: number;
	timings: ParsedTiming[];
	region: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
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
		providerSpecifics
			.estimatePrice({
				region,
				durationInMilliseconds: estimatedBillingDurationInMilliseconds,
				memorySizeInMb,
				diskSizeInMb,
				lambdasInvoked: functionsInvoked,
			})
			.toPrecision(5),
	);

	return {accruedSoFar, estimatedBillingDurationInMilliseconds};
};
