import {_Object} from '@aws-sdk/client-s3';
import {Internals} from 'remotion';
import {
	getNewestRenderBucket,
	getOptimization,
} from '../chunk-optimization/s3-optimization-file';
import {
	EncodingProgress,
	ENCODING_PROGRESS_KEY,
	LambdaPayload,
	LambdaRoutines,
	LAMBDA_INITIALIZED_KEY,
	MEMORY_SIZE,
	OUT_NAME,
	REGION,
	RenderMetadata,
	RENDER_METADATA_KEY,
} from '../constants';
import {inspectErrors} from '../inspect-errors';
import {lambdaLs, lambdaReadFile} from '../io';
import {getPriceInCents} from '../pricing/get-price';
import {streamToString} from '../stream-to-string';

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
}: {
	exists: boolean;
	bucketName: string;
}): Promise<EncodingProgress | null> => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: ENCODING_PROGRESS_KEY,
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
}: {
	exists: boolean;
	bucketName: string;
}) => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: RENDER_METADATA_KEY,
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
		forceS3: false,
	});
	const s3contents = await lambdaLs({
		bucketName: lambdaParams.bucketName,
		forceS3: true,
	});

	if (!contents) {
		throw new Error('Could not get list contents');
	}

	const bucketSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const chunks = contents.filter((c) => c.Key?.match(/chunk(.*).mp4/));
	const output = s3contents.find((c) => c.Key?.includes(OUT_NAME)) ?? null;
	const lambdasInvoked = contents.filter((c) =>
		c.Key?.startsWith(LAMBDA_INITIALIZED_KEY)
	).length;
	const errors = contents
		// TODO: unhardcode
		.filter(
			(c) =>
				c.Key?.startsWith('error-chunk') || c.Key?.startsWith('error-stitcher')
		)
		.map((c) => c.Key)
		.filter(Internals.truthy);

	const [
		encodingStatus,
		renderMetadata,
		errorExplanations,
		optimization,
		bucket,
	] = await Promise.all([
		getEncodingMetadata({
			exists: Boolean(contents.find((c) => c.Key === ENCODING_PROGRESS_KEY)),
			bucketName: lambdaParams.bucketName,
		}),
		getRenderMetadata({
			exists: Boolean(contents.find((c) => c.Key === RENDER_METADATA_KEY)),
			bucketName: lambdaParams.bucketName,
		}),
		inspectErrors({errs: errors, bucket: lambdaParams.bucketName}),
		getOptimization(),
		getNewestRenderBucket(),
	]);

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
				'Estimated cost only. Does not include charges for EFS and other AWS services.',
		},
		renderMetadata,
		bucket,
		outputFile: output
			? `https://s3.${REGION}.amazonaws.com/${lambdaParams.bucketName}/${OUT_NAME}`
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
