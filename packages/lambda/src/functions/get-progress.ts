import {_Object} from '@aws-sdk/client-s3';
import {Internals} from 'remotion';
import {AwsRegion} from '../pricing/aws-regions';
import {calculatePrice} from '../pricing/calculate-price';
import {
	chunkKey,
	EncodingProgress,
	encodingProgressKey,
	getErrorKeyPrefix,
	lambdaInitializedKey,
	LambdaPayload,
	LambdaRoutines,
	lambdaTimingsPrefix,
	outName,
	RenderMetadata,
	renderMetadataKey,
	rendersPrefix,
} from '../shared/constants';
import {parseLambdaTimingsKey} from '../shared/parse-lambda-timings-key';
import {streamToString} from '../shared/stream-to-string';
import {getCleanupProgress} from './helpers/get-cleanup-progress';
import {getCurrentRegion} from './helpers/get-current-region';
import {inspectErrors} from './helpers/inspect-errors';
import {lambdaLs, lambdaReadFile} from './helpers/io';
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

const getEncodingMetadata = async ({
	exists,
	bucketName,
	renderId,
	region,
}: {
	exists: boolean;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
}): Promise<EncodingProgress | null> => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: encodingProgressKey(renderId),
		region,
	});

	try {
		const encodingProgress = JSON.parse(
			await streamToString(Body)
		) as EncodingProgress;

		return encodingProgress;
	} catch (err) {
		// The file may not yet have been fully written
		return null;
	}
};

const getRenderMetadata = async ({
	exists,
	bucketName,
	renderId,
	region,
}: {
	exists: boolean;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
}) => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: renderMetadataKey(renderId),
		region,
	});

	const renderMetadataResponse = JSON.parse(
		await streamToString(Body)
	) as RenderMetadata;

	return renderMetadataResponse;
};

const getTimeToFinish = ({
	renderMetadata,
	output,
}: {
	renderMetadata: RenderMetadata | null;
	output: _Object | null;
}) => {
	if (!output) {
		return null;
	}

	if (!output.LastModified) {
		return null;
	}

	if (!renderMetadata) {
		return null;
	}

	return output.LastModified.getTime() - renderMetadata.startedDate;
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

	const lambdasInvoked = contents.filter((c) =>
		c.Key?.startsWith(lambdaInitializedKey(lambdaParams.renderId))
	).length;

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

	const errors = contents
		.filter((c) => c.Key?.startsWith(getErrorKeyPrefix(lambdaParams.renderId)))
		.map((c) => c.Key)
		.filter(Internals.truthy);

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
				errs: errors,
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

	const getOutputFile = () => {
		if (!output) {
			return null;
		}

		if (!renderMetadata) {
			throw new Error('unexpectedly did not get renderMetadata');
		}

		return `https://s3.${process.env.AWS_REGION as AwsRegion}.amazonaws.com/${
			lambdaParams.bucketName
		}/${outName(lambdaParams.renderId, renderMetadata.codec)}`;
	};

	const cleanup = getCleanupProgress({
		chunkCount: renderMetadata?.totalChunks ?? 0,
		chunks,
		output: getOutputFile(),
	});

	return {
		chunks: chunks.length,
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
		outputFile: getOutputFile(),
		timeToFinish,
		errors: errorExplanations,
		fatalErrorEncountered: errorExplanations.some(isFatalError),
		currentTime: Date.now(),
		bucketSize,
		lambdasInvoked,
		cleanup,
	};
};
