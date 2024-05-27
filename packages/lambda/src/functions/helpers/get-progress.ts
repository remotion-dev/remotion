import {RenderInternals} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';
import type {AwsRegion} from '../../pricing/aws-regions';
import type {CustomCredentials} from '../../shared/aws-clients';
import type {RenderProgress} from '../../shared/constants';
import {
	MAX_EPHEMERAL_STORAGE_IN_MB,
	renderMetadataKey,
	rendersPrefix,
} from '../../shared/constants';
import {truthy} from '../../shared/truthy';
import {calculateChunkTimes} from './calculate-chunk-times';
import {estimatePriceFromBucket} from './calculate-price-from-bucket';
import {checkIfRenderExists} from './check-if-render-exists';
import {getExpectedOutName} from './expected-out-name';
import {findOutputFileInBucket} from './find-output-file-in-bucket';
import {formatCostsInfo} from './format-costs-info';
import {getCleanupProgress} from './get-cleanup-progress';
import {getCurrentRegionInFunction} from './get-current-region';
import {getOverallProgress} from './get-overall-progress';
import {getOverallProgressS3} from './get-overall-progress-s3';
import {getRenderMetadata} from './get-render-metadata';
import {getTimeToFinish} from './get-time-to-finish';
import {inspectErrors} from './inspect-errors';
import {lambdaLs} from './io';
import {makeTimeoutError} from './make-timeout-error';
import {lambdaRenderHasAudioVideo} from './render-has-audio-video';
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
	const overallProgress = await getOverallProgressS3({
		renderId,
		bucketName,
		expectedBucketOwner,
	});

	if (overallProgress?.postRenderData) {
		const outData = getExpectedOutName(
			overallProgress.postRenderData.renderMetadata,
			bucketName,
			customCredentials,
		);

		const totalFrameCount =
			overallProgress.postRenderData.renderMetadata.type === 'still'
				? 1
				: RenderInternals.getFramesToRender(
						overallProgress.postRenderData.renderMetadata.frameRange,
						overallProgress.postRenderData.renderMetadata.everyNthFrame,
					).length;

		return {
			framesRendered: totalFrameCount,
			bucket: bucketName,
			renderSize: overallProgress.postRenderData.renderSize,
			chunks: overallProgress.postRenderData.renderMetadata.totalChunks,
			cleanup: {
				doneIn: overallProgress.postRenderData.timeToCleanUp,
				filesDeleted: overallProgress.postRenderData.filesCleanedUp,
				minFilesToDelete: overallProgress.postRenderData.filesCleanedUp,
			},
			costs: {
				accruedSoFar: overallProgress.postRenderData.cost.estimatedCost,
				displayCost: overallProgress.postRenderData.cost.estimatedDisplayCost,
				currency: overallProgress.postRenderData.cost.currency,
				disclaimer: overallProgress.postRenderData.cost.disclaimer,
			},
			currentTime: Date.now(),
			done: true,
			encodingStatus: {
				framesEncoded: totalFrameCount,
				combinedFrames: totalFrameCount,
				timeToCombine: overallProgress.postRenderData.timeToCombine,
			},
			errors: overallProgress.postRenderData.errors,
			fatalErrorEncountered: false,
			lambdasInvoked: overallProgress.postRenderData.renderMetadata.totalChunks,
			outputFile: overallProgress.postRenderData.outputFile,
			renderId,
			renderMetadata: overallProgress.postRenderData.renderMetadata,
			timeToFinish: overallProgress.postRenderData.timeToFinish,
			timeToFinishChunks: overallProgress.postRenderData.timeToRenderChunks,
			overallProgress: 1,
			retriesInfo: overallProgress.postRenderData.retriesInfo,
			outKey: outData.key,
			outBucket: outData.renderBucketName,
			mostExpensiveFrameRanges:
				overallProgress.postRenderData.mostExpensiveFrameRanges ?? null,
			timeToEncode: overallProgress.postRenderData.timeToEncode,
			outputSizeInBytes: overallProgress.postRenderData.outputSize,
			type: 'success',
			estimatedBillingDurationInMilliseconds:
				overallProgress.postRenderData.estimatedBillingDurationInMilliseconds,
			timeToCombine: overallProgress.postRenderData.timeToCombine,
			combinedFrames: totalFrameCount,
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

	const {hasAudio, hasVideo} = renderMetadata
		? lambdaRenderHasAudioVideo(renderMetadata)
		: {hasAudio: false, hasVideo: false};

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

	const chunkMultiplier = [hasAudio, hasVideo].filter(truthy).length;

	const allChunks =
		(overallProgress?.chunks ?? []).length / chunkMultiplier ===
		(renderMetadata?.totalChunks ?? Infinity);
	const renderSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const frameCount = renderMetadata
		? RenderInternals.getFramesToRender(
				renderMetadata.frameRange,
				renderMetadata.everyNthFrame,
			).length
		: null;

	const chunkCount = overallProgress?.chunks.length ?? 0;

	const missingChunks = renderMetadata
		? new Array(renderMetadata.totalChunks)
				.fill(true)
				.map((_, i) => i)
				.filter((index) => {
					return !(overallProgress?.chunks ?? []).find((c) => c === index);
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
					renderId,
					missingChunks: missingChunks ?? [],
				})
			: null,
		...errorExplanations,
	].filter(NoReactInternals.truthy);

	return {
		framesRendered: overallProgress?.framesRendered ?? 0,
		chunks: chunkCount,
		done: false,
		encodingStatus: {
			framesEncoded: overallProgress?.framesEncoded ?? 0,
			combinedFrames: overallProgress?.combinedFrames ?? 0,
			timeToCombine: overallProgress?.timeToCombine ?? null,
		},
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
		lambdasInvoked: overallProgress?.lambdasInvoked ?? 0,
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
				renderMetadata && frameCount
					? overallProgress?.framesEncoded ?? 0 / frameCount
					: 0,
			invoking: renderMetadata
				? (overallProgress?.lambdasInvoked ?? 0) /
					renderMetadata.estimatedRenderLambdaInvokations
				: 0,
			rendering: renderMetadata ? chunkCount / renderMetadata.totalChunks : 0,
			frames: (overallProgress?.framesRendered ?? 0) / (frameCount ?? 1),
		}),
		retriesInfo: overallProgress?.retries ?? [],
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
		combinedFrames: overallProgress?.combinedFrames ?? 0,
		timeToCombine: overallProgress?.timeToCombine ?? null,
		type: 'success',
	};
};
