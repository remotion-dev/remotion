import {RenderInternals} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';
import type {AwsRegion} from '../../pricing/aws-regions';
import type {CustomCredentials} from '../../shared/aws-clients';
import type {RenderProgress} from '../../shared/constants';
import {
	chunkKey,
	encodingProgressKey,
	MAX_EPHEMERAL_STORAGE_IN_MB,
	renderMetadataKey,
	rendersPrefix,
} from '../../shared/constants';
import {parseLambdaChunkKey} from '../../shared/parse-chunk-key';
import {calculateChunkTimes} from './calculate-chunk-times';
import {estimatePriceFromBucket} from './calculate-price-from-bucket';
import {checkIfRenderExists} from './check-if-render-exists';
import {getExpectedOutName} from './expected-out-name';
import {findOutputFileInBucket} from './find-output-file-in-bucket';
import {formatCostsInfo} from './format-costs-info';
import {getCleanupProgress} from './get-cleanup-progress';
import {getCurrentRegionInFunction} from './get-current-region';
import {getEncodingMetadata} from './get-encoding-metadata';
import {getFinalEncodingStatus} from './get-final-encoding-status';
import {getLambdasInvokedStats} from './get-lambdas-invoked-stats';
import {getOverallProgress} from './get-overall-progress';
import {getPostRenderData} from './get-post-render-data';
import {getRenderMetadata} from './get-render-metadata';
import {getRenderedFramesProgress} from './get-rendered-frames-progress';
import {getRetryStats} from './get-retry-stats';
import {getTimeToFinish} from './get-time-to-finish';
import {inspectErrors} from './inspect-errors';
import {lambdaLs} from './io';
import {makeTimeoutError} from './make-timeout-error';
import type {EnhancedErrorInfo} from './write-lambda-error';

export const getProgress = async ({
	bucketName,
	renderId,
	expectedBucketOwner,
	region,
	memorySizeInMb,
	timeoutInMilliseconds,
	customCredentials,
}: {
	bucketName: string;
	renderId: string;
	expectedBucketOwner: string;
	region: AwsRegion;
	memorySizeInMb: number;
	timeoutInMilliseconds: number;
	customCredentials: CustomCredentials | null;
}): Promise<RenderProgress> => {
	const postRenderData = await getPostRenderData({
		bucketName,
		region,
		renderId,
		expectedBucketOwner,
	});

	if (postRenderData) {
		const outData = getExpectedOutName(
			postRenderData.renderMetadata,
			bucketName,
			customCredentials,
		);

		const totalFrameCount = RenderInternals.getFramesToRender(
			postRenderData.renderMetadata.frameRange,
			postRenderData.renderMetadata.everyNthFrame,
		).length;

		return {
			framesRendered: totalFrameCount,
			bucket: bucketName,
			renderSize: postRenderData.renderSize,
			chunks: postRenderData.renderMetadata.totalChunks,
			cleanup: {
				doneIn: postRenderData.timeToCleanUp,
				filesDeleted: postRenderData.filesCleanedUp,
				minFilesToDelete: postRenderData.filesCleanedUp,
			},
			costs: {
				accruedSoFar: postRenderData.cost.estimatedCost,
				displayCost: postRenderData.cost.estimatedDisplayCost,
				currency: postRenderData.cost.currency,
				disclaimer: postRenderData.cost.disclaimer,
			},
			currentTime: Date.now(),
			done: true,
			encodingStatus: {
				framesEncoded: totalFrameCount,
			},
			errors: postRenderData.errors,
			fatalErrorEncountered: false,
			lambdasInvoked: postRenderData.renderMetadata.totalChunks,
			outputFile: postRenderData.outputFile,
			renderId,
			renderMetadata: postRenderData.renderMetadata,
			timeToFinish: postRenderData.timeToFinish,
			timeToFinishChunks: postRenderData.timeToRenderChunks,
			overallProgress: 1,
			retriesInfo: postRenderData.retriesInfo,
			outKey: outData.key,
			outBucket: outData.renderBucketName,
			mostExpensiveFrameRanges: postRenderData.mostExpensiveFrameRanges ?? null,
			timeToEncode: postRenderData.timeToEncode,
			outputSizeInBytes: postRenderData.outputSize,
			type: 'success',
			estimatedBillingDurationInMilliseconds:
				postRenderData.estimatedBillingDurationInMilliseconds,
		};
	}

	const contents = await lambdaLs({
		bucketName,
		prefix: rendersPrefix(renderId),
		region: getCurrentRegionInFunction(),
		expectedBucketOwner,
	});

	const renderMetadataExists = Boolean(
		contents.find((c) => c.Key === renderMetadataKey(renderId)),
	);

	const [renderMetadata, errorExplanations] = await Promise.all([
		renderMetadataExists
			? getRenderMetadata({
					bucketName,
					renderId,
					region: getCurrentRegionInFunction(),
					expectedBucketOwner,
				})
			: null,
		inspectErrors({
			contents,
			renderId,
			bucket: bucketName,
			region: getCurrentRegionInFunction(),
			expectedBucketOwner,
		}),
	]);

	if (renderMetadata?.type === 'still') {
		throw new Error(
			"You don't need to call getRenderProgress() on a still render. Once you have obtained the `renderId`, the render is already done! 😉",
		);
	}

	checkIfRenderExists(
		contents,
		renderId,
		bucketName,
		getCurrentRegionInFunction(),
	);

	const outputFile = renderMetadata
		? await findOutputFileInBucket({
				bucketName,
				renderMetadata,
				region,
				customCredentials,
			})
		: null;

	const priceFromBucket = estimatePriceFromBucket({
		contents,
		renderMetadata,
		memorySizeInMb,
		outputFileMetadata: outputFile,
		lambdasInvoked: renderMetadata?.estimatedRenderLambdaInvokations ?? 0,
		// We cannot determine the ephemeral storage size, so we
		// overestimate the price, but will only have a miniscule effect (~0.2%)
		diskSizeInMb: MAX_EPHEMERAL_STORAGE_IN_MB,
	});

	const cleanup = getCleanupProgress({
		chunkCount: renderMetadata?.totalChunks ?? 0,
		contents,
		output: outputFile?.url ?? null,
		renderId,
	});

	const timeToFinish = getTimeToFinish({
		lastModified: outputFile?.lastModified ?? null,
		renderMetadata,
	});

	const chunks = contents.filter((c) => c.Key?.startsWith(chunkKey(renderId)));
	const framesRendered = renderMetadata
		? getRenderedFramesProgress({
				contents,
				everyNthFrame: renderMetadata.everyNthFrame,
				frameRange: renderMetadata.frameRange,
				framesPerLambda: renderMetadata.framesPerLambda,
				renderId,
			})
		: 0;

	const allChunks = chunks.length === (renderMetadata?.totalChunks ?? Infinity);
	const renderSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const lambdasInvokedStats = getLambdasInvokedStats({
		contents,
		renderId,
	});

	const retriesInfo = getRetryStats({
		contents,
		renderId,
	});

	const frameCount = renderMetadata
		? RenderInternals.getFramesToRender(
				renderMetadata.frameRange,
				renderMetadata.everyNthFrame,
			).length
		: null;

	const encodingStatus = getEncodingMetadata({
		exists: contents.find((c) => c.Key === encodingProgressKey(renderId)),
		frameCount: frameCount === null ? 0 : frameCount,
	});

	const finalEncodingStatus = getFinalEncodingStatus({
		encodingProgress: encodingStatus,
		outputFileExists: Boolean(outputFile),
		renderMetadata,
	});

	const chunkCount = outputFile
		? renderMetadata?.totalChunks ?? 0
		: chunks.length;

	const availableChunks = chunks.map((c) =>
		parseLambdaChunkKey(c.Key as string),
	);

	const missingChunks = renderMetadata
		? new Array(renderMetadata.totalChunks)
				.fill(true)
				.map((_, i) => i)
				.filter((index) => {
					return !availableChunks.find((c) => c.chunk === index);
				})
		: null;

	// We add a 20 second buffer for it, since AWS timeshifts can be quite a lot. Once it's 20sec over the limit, we consider it timed out

	// 1. If we have missing chunks, we consider it timed out
	const isBeyondTimeoutAndMissingChunks =
		renderMetadata &&
		Date.now() > renderMetadata.startedDate + timeoutInMilliseconds + 20000 &&
		missingChunks &&
		missingChunks.length > 0;

	// 2. If we have no missing chunks, but the encoding is not done, even after the additional `merge` function has been spawned, we consider it timed out
	const isBeyondTimeoutAndHasStitchTimeout =
		renderMetadata &&
		Date.now() > renderMetadata.startedDate + timeoutInMilliseconds * 2 + 20000;

	const allErrors: EnhancedErrorInfo[] = [
		isBeyondTimeoutAndMissingChunks || isBeyondTimeoutAndHasStitchTimeout
			? makeTimeoutError({
					timeoutInMilliseconds,
					renderMetadata,
					chunks,
					renderId,
					missingChunks: missingChunks ?? [],
				})
			: null,
		...errorExplanations,
	].filter(NoReactInternals.truthy);

	return {
		framesRendered,
		chunks: chunkCount,
		done: false,
		encodingStatus,
		costs: priceFromBucket
			? formatCostsInfo(priceFromBucket.accruedSoFar)
			: formatCostsInfo(0),
		renderId,
		renderMetadata,
		bucket: bucketName,
		outputFile: outputFile?.url ?? null,
		timeToFinish,
		errors: allErrors,
		fatalErrorEncountered: allErrors.some((f) => f.isFatal && !f.willRetry),
		currentTime: Date.now(),
		renderSize,
		lambdasInvoked: lambdasInvokedStats.lambdasInvoked,
		cleanup,
		timeToFinishChunks: allChunks
			? calculateChunkTimes({
					contents,
					renderId,
					type: 'absolute-time',
				})
			: null,
		overallProgress: getOverallProgress({
			cleanup: cleanup ? cleanup.filesDeleted / cleanup.minFilesToDelete : 0,
			encoding:
				finalEncodingStatus && renderMetadata && frameCount
					? finalEncodingStatus.framesEncoded / frameCount
					: 0,
			invoking: renderMetadata
				? lambdasInvokedStats.lambdasInvoked /
					renderMetadata.estimatedRenderLambdaInvokations
				: 0,
			rendering: renderMetadata ? chunkCount / renderMetadata.totalChunks : 0,
			frames: frameCount === null ? 0 : framesRendered / frameCount,
		}),
		retriesInfo,
		outKey:
			outputFile && renderMetadata
				? getExpectedOutName(renderMetadata, bucketName, customCredentials).key
				: null,
		outBucket:
			outputFile && renderMetadata
				? getExpectedOutName(renderMetadata, bucketName, customCredentials)
						.renderBucketName
				: null,
		mostExpensiveFrameRanges: null,
		timeToEncode: null,
		outputSizeInBytes: outputFile?.size ?? null,
		estimatedBillingDurationInMilliseconds: priceFromBucket
			? priceFromBucket.estimatedBillingDurationInMilliseconds
			: null,
		type: 'success',
	};
};
