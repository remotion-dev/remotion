import {calculatePrice} from '../pricing/calculate-price';
import {
	chunkKey,
	EncodingProgress,
	encodingProgressKey,
	lambdaInitializedPrefix,
	LambdaPayload,
	LambdaRoutines,
	lambdaTimingsPrefix,
	outName,
	RenderMetadata,
	renderMetadataKey,
	rendersPrefix,
} from '../shared/constants';
import {parseLambdaTimingsKey} from '../shared/parse-lambda-timings-key';
import {findOutputFileInBucket} from './helpers/find-output-file-in-bucket';
import {getCleanupProgress} from './helpers/get-cleanup-progress';
import {getCurrentRegion} from './helpers/get-current-region';
import {getEncodingMetadata} from './helpers/get-encoding-metadata';
import {getRenderMetadata} from './helpers/get-render-metadata';
import {getTimeToFinish} from './helpers/get-time-to-finish';
import {inspectErrors} from './helpers/inspect-errors';
import {lambdaLs} from './helpers/io';
import {isFatalError} from './helpers/is-fatal-error';

type Options = {
	expectedBucketOwner: string;
};

const getFinalEncodingStatus = ({
	encodingStatus: encodingProgress,
	renderMetadata,
	outputFileExists,
}: {
	encodingStatus: EncodingProgress | null;
	renderMetadata: RenderMetadata | null;
	outputFileExists: boolean;
}): EncodingProgress | null => {
	if (!renderMetadata) {
		return null;
	}

	if (outputFileExists) {
		return {
			framesEncoded: renderMetadata.videoConfig.durationInFrames,
		};
	}

	return encodingProgress;
};

export const progressHandler = async (
	lambdaParams: LambdaPayload,
	options: Options
) => {
	if (lambdaParams.type !== LambdaRoutines.status) {
		throw new TypeError('Expected status type');
	}

	const contents = await lambdaLs({
		bucketName: lambdaParams.bucketName,
		prefix: rendersPrefix(lambdaParams.renderId),
		region: getCurrentRegion(),
		expectedBucketOwner: options.expectedBucketOwner,
	});

	if (!contents) {
		throw new Error('Could not get list contents');
	}

	const bucketSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const chunks = contents.filter((c) =>
		c.Key?.startsWith(chunkKey(lambdaParams.renderId))
	);

	const finishedTimings = contents.filter((c) =>
		c.Key?.startsWith(lambdaTimingsPrefix(lambdaParams.renderId))
	);

	const parsedTimings = finishedTimings.map((f) =>
		parseLambdaTimingsKey(f.Key as string)
	);

	// TODO: Should also calculate invoker functions, and main function
	const totalEncodingTimings = parsedTimings
		.map((p) => p.end - p.start)
		.reduce((a, b) => a + b, 0);

	const [encodingStatus, renderMetadata, errorExplanations] = await Promise.all(
		[
			getEncodingMetadata({
				exists: Boolean(
					contents.find(
						(c) => c.Key === encodingProgressKey(lambdaParams.renderId)
					)
				),
				bucketName: lambdaParams.bucketName,
				renderId: lambdaParams.renderId,
				region: getCurrentRegion(),
			}),
			getRenderMetadata({
				exists: Boolean(
					contents.find(
						(c) => c.Key === renderMetadataKey(lambdaParams.renderId)
					)
				),
				bucketName: lambdaParams.bucketName,
				renderId: lambdaParams.renderId,
				region: getCurrentRegion(),
			}),
			inspectErrors({
				contents,
				renderId: lambdaParams.renderId,
				bucket: lambdaParams.bucketName,
				region: getCurrentRegion(),
			}),
		]
	);

	const output = renderMetadata
		? contents.find((c) =>
				c.Key?.includes(outName(lambdaParams.renderId, renderMetadata.codec))
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

	const outputFile = findOutputFileInBucket({
		bucketName: lambdaParams.bucketName,
		output,
		renderId: lambdaParams.renderId,
		renderMetadata,
	});

	const lambdasInvoked = outputFile
		? renderMetadata?.totalChunks ?? 0
		: contents.filter((c) =>
				c.Key?.startsWith(lambdaInitializedPrefix(lambdaParams.renderId))
		  ).length;

	const cleanup = getCleanupProgress({
		chunkCount: renderMetadata?.totalChunks ?? 0,
		contents,
		output: outputFile,
		renderId: lambdaParams.renderId,
	});

	return {
		chunks: outputFile ? renderMetadata?.totalChunks ?? 0 : chunks.length,
		done: Boolean(output) && cleanup?.done,
		encodingStatus: getFinalEncodingStatus({
			encodingStatus,
			outputFileExists: Boolean(output),
			renderMetadata,
		}),
		costs: {
			accruedSoFar,
			displayCost: new Intl.NumberFormat('en-US', {
				currency: 'USD',
				currencyDisplay: 'narrowSymbol',
			}).format(accruedSoFar),
			currency: 'USD',
			disclaimer:
				'Estimated cost only. Does not include charges for other AWS services.',
		},
		renderId: lambdaParams.renderId,
		renderMetadata,
		bucket: lambdaParams.bucketName,
		outputFile,
		timeToFinish,
		errors: errorExplanations,
		fatalErrorEncountered: errorExplanations.some(isFatalError),
		currentTime: Date.now(),
		bucketSize,
		lambdasInvoked,
		cleanup,
	};
};
