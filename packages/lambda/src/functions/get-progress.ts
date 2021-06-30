import {_Object} from '@aws-sdk/client-s3';
import {Internals} from 'remotion';
import {AwsRegion} from '../pricing/aws-regions';
import {calculatePrice} from '../pricing/calculate-price';
import {
	chunkKey,
	EncodingProgress,
	encodingProgressKey,
	getRendererErrorKeyPrefix,
	getStitcherErrorKeyPrefix,
	lambdaInitializedKey,
	LambdaPayload,
	LambdaRoutines,
	outName,
	RenderMetadata,
	renderMetadataKey,
	rendersPrefix,
} from '../shared/constants';
import {streamToString} from '../shared/stream-to-string';
import {getOptimization} from './chunk-optimization/s3-optimization-file';
import {getCurrentRegion} from './helpers/get-current-region';
import {inspectErrors} from './helpers/inspect-errors';
import {lambdaLs, lambdaReadFile} from './helpers/io';

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
			framesRendered: renderMetadata.totalFrames,
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
	const errors = contents
		.filter(
			(c) =>
				c.Key?.startsWith(getRendererErrorKeyPrefix(lambdaParams.renderId)) ||
				c.Key?.startsWith(getStitcherErrorKeyPrefix(lambdaParams.renderId))
		)
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
	const optimization = renderMetadata
		? await getOptimization({
				bucketName: lambdaParams.bucketName,
				siteId: renderMetadata.siteId,
				compositionId: renderMetadata.compositionId,
				region: getCurrentRegion(),
				expectedBucketOwner: options.expectedBucketOwner,
		  })
		: null;

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

	const accruedSoFar = Number(
		(
			calculatePrice({
				region: getCurrentRegion(),
				durationInMiliseconds: elapsedTime,
				memorySize: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
			}) * (renderMetadata?.estimatedLambdaInvokations ?? 0)
		).toPrecision(5)
	);

	const outputFile = () => {
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

	return {
		chunks: chunks.length,
		done: Boolean(output),
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
		outputFile: outputFile(),
		// TODO: Only fetch optimization if actually shown
		optimizationForNextRender: optimization,
		timeToFinish,
		errors,
		errorExplanations,
		currentTime: Date.now(),
		bucketSize,
		lambdasInvoked,
	};
};
