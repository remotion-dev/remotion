import type {_Object} from '@aws-sdk/client-s3';
import {estimatePrice} from '../../api/estimate-price';
import type {RenderMetadata} from '../../shared/constants';
import {lambdaTimingsPrefix} from '../../shared/constants';
import {parseLambdaTimingsKey} from '../../shared/parse-lambda-timings-key';
import type {LambdaArchitecture} from '../../shared/validate-architecture';
import {calculateChunkTimes} from './calculate-chunk-times';
import type {OutputFileMetadata} from './find-output-file-in-bucket';
import {getCurrentRegionInFunction} from './get-current-region';
import {getTimeToFinish} from './get-time-to-finish';

export const estimatePriceFromBucket = ({
	contents,
	renderMetadata,
	memorySizeInMb,
	outputFileMetadata,
	architecture,
	diskSizeInMb,
	lambdasInvoked,
}: {
	contents: _Object[];
	renderMetadata: RenderMetadata | null;
	memorySizeInMb: number;
	outputFileMetadata: OutputFileMetadata | null;
	architecture: LambdaArchitecture;
	diskSizeInMb: number;
	lambdasInvoked: number;
}) => {
	if (!renderMetadata) {
		return null;
	}

	const parsedTimings = contents
		.filter((c) =>
			c.Key?.startsWith(lambdaTimingsPrefix(renderMetadata.renderId))
		)
		.map((f) => parseLambdaTimingsKey(f.Key as string));

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
		(renderMetadata?.totalChunks ?? 0) - parsedTimings.length
	);
	const timeElapsedOfUnfinished = new Array(unfinished)
		.fill(true)
		.map(() => elapsedTime)
		.reduce((a, b) => a + b, 0);

	const accruedSoFar = Number(
		estimatePrice({
			region: getCurrentRegionInFunction(),
			durationInMiliseconds:
				calculateChunkTimes({
					contents,
					renderId: renderMetadata.renderId,
					type: 'combined-time-for-cost-calculation',
				}) + timeElapsedOfUnfinished,
			memorySizeInMb,
			architecture,
			diskSizeInMb,
			lambdasInvoked,
		}).toPrecision(5)
	);
	return accruedSoFar;
};
