import {_Object} from '@aws-sdk/client-s3';
import {calculatePrice} from '../../pricing/calculate-price';
import {
	lambdaTimingsPrefix,
	outName,
	RenderMetadata,
} from '../../shared/constants';
import {parseLambdaTimingsKey} from '../../shared/parse-lambda-timings-key';
import {getCurrentRegion} from './get-current-region';
import {getTimeToFinish} from './get-time-to-finish';

// TODO: Should differentiate between finished and in progress
export const calculatePriceFromBucket = (
	renderId: string,
	contents: _Object[],
	renderMetadata: RenderMetadata | null
) => {
	if (!renderMetadata) {
		return null;
	}

	const finishedTimings = contents.filter((c) =>
		c.Key?.startsWith(lambdaTimingsPrefix(renderId))
	);

	const parsedTimings = finishedTimings.map((f) =>
		parseLambdaTimingsKey(f.Key as string)
	);

	// TODO: Should also calculate invoker functions, and main function
	const totalEncodingTimings = parsedTimings
		.map((p) => p.end - p.start)
		.reduce((a, b) => a + b, 0);

	const output = renderMetadata
		? contents.find((c) =>
				c.Key?.includes(outName(renderId, renderMetadata.codec))
		  ) ?? null
		: null;

	const timeToFinish = getTimeToFinish({
		output,
		renderMetadata,
	});

	const elapsedTime =
		timeToFinish === null
			? Date.now() - (renderMetadata?.startedDate ?? 0)
			: timeToFinish;

	const unfinished = (renderMetadata?.totalChunks ?? 0) - parsedTimings.length;
	const timeElapsedOfUnfinished = new Array(unfinished)
		.fill(true)
		.map(() => elapsedTime)
		.reduce((a, b) => a + b, 0);

	const accruedSoFar = Number(
		calculatePrice({
			region: getCurrentRegion(),
			durationInMiliseconds: totalEncodingTimings + timeElapsedOfUnfinished,
			memorySize: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		}).toPrecision(5)
	);
	return accruedSoFar;
};
