import {calculateBillingDuration} from './calculate-billing-duration';
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
	fatalErrorTimestamp,
}: {
	renderMetadata: RenderMetadata<Provider> | null;
	memorySizeInMb: number;
	diskSizeInMb: number;
	functionsInvoked: number;
	timings: ParsedTiming[];
	region: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
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
