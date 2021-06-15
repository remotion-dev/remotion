import {_Object} from '@aws-sdk/client-s3';
import {Internals} from 'remotion';
import {
	getNewestRenderBucket,
	getOptimization,
} from '../chunk-optimization/s3-optimization-file';
import {
	chunkKey,
	EncodingProgress,
	encodingProgressKey,
	getRendererErrorKeyPrefix,
	getStitcherErrorKeyPrefix,
	lambdaInitializedKey,
	LambdaPayload,
	LambdaRoutines,
	MEMORY_SIZE,
	outName,
	REGION,
	RenderMetadata,
	renderMetadataKey,
	rendersPrefix,
} from '../constants';
import {streamToString} from '../helpers/stream-to-string';
import {inspectErrors} from '../inspect-errors';
import {lambdaLs, lambdaReadFile} from '../io';
import {getPriceInCents} from '../pricing/get-price';

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
}: {
	exists: boolean;
	bucketName: string;
	renderId: string;
}): Promise<EncodingProgress | null> => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: encodingProgressKey(renderId),
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
}: {
	exists: boolean;
	bucketName: string;
	renderId: string;
}) => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: renderMetadataKey(renderId),
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

export const progressHandler = async (lambdaParams: LambdaPayload) => {
	if (lambdaParams.type !== LambdaRoutines.status) {
		throw new TypeError('Expected status type');
	}

	const contents = await lambdaLs({
		bucketName: lambdaParams.bucketName,
		forceS3: true,
		prefix: rendersPrefix(lambdaParams.renderId),
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
	const output =
		contents.find((c) => c.Key?.includes(outName(lambdaParams.renderId))) ??
		null;
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

	const [encodingStatus, renderMetadata, errorExplanations, bucket] =
		await Promise.all([
			getEncodingMetadata({
				exists: Boolean(
					contents.find(
						(c) => c.Key === encodingProgressKey(lambdaParams.renderId)
					)
				),
				bucketName: lambdaParams.bucketName,
				renderId: lambdaParams.renderId,
			}),
			getRenderMetadata({
				exists: Boolean(
					contents.find(
						(c) => c.Key === renderMetadataKey(lambdaParams.renderId)
					)
				),
				bucketName: lambdaParams.bucketName,
				renderId: lambdaParams.renderId,
			}),
			inspectErrors({errs: errors, bucket: lambdaParams.bucketName}),
			getNewestRenderBucket(),
		]);
	const optimization = renderMetadata
		? await getOptimization({
				siteId: renderMetadata.siteId,
				compositionId: renderMetadata.compositionId,
		  })
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
			getPriceInCents({
				region: REGION,
				durationMs: elapsedTime,
				memory: MEMORY_SIZE,
			}) * (renderMetadata?.estimatedLambdaInvokations ?? 0)
		).toPrecision(5)
	);

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
		bucket,
		outputFile: output
			? `https://s3.${REGION}.amazonaws.com/${
					lambdaParams.bucketName
			  }/${outName(lambdaParams.renderId)}`
			: null,
		// TODO: Only fetch optimization if actually shown
		optimizationForNextRender: optimization,
		timeToFinish,
		//	errors,
		errorExplanations,
		currentTime: Date.now(),
		bucketSize,
		lambdasInvoked,
	};
};
