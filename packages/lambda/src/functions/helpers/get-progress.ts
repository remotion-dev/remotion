import {Internals} from 'remotion';
import type {AwsRegion} from '../../pricing/aws-regions';
import type {RenderProgress} from '../../shared/constants';
import {
	chunkKey,
	encodingProgressKey,
	MAX_EPHEMERAL_STORAGE_IN_MB,
	renderMetadataKey,
	rendersPrefix,
} from '../../shared/constants';
import {DOCS_URL} from '../../shared/docs-url';
import {calculateChunkTimes} from './calculate-chunk-times';
import {estimatePriceFromBucket} from './calculate-price-from-bucket';
import {checkIfRenderExists} from './check-if-render-exists';
import {getExpectedOutName} from './expected-out-name';
import {findOutputFileInBucket} from './find-output-file-in-bucket';
import {formatCostsInfo} from './format-costs-info';
import {getCleanupProgress} from './get-cleanup-progress';
import {getCurrentArchitecture} from './get-current-architecture';
import {getCurrentRegionInFunction} from './get-current-region';
import {getEncodingMetadata} from './get-encoding-metadata';
import {getFinalEncodingStatus} from './get-final-encoding-status';
import {getLambdasInvokedStats} from './get-lambdas-invoked-stats';
import {getOverallProgress} from './get-overall-progress';
import {getPostRenderData} from './get-post-render-data';
import {getRenderMetadata} from './get-render-metadata';
import {getRetryStats} from './get-retry-stats';
import {getTimeToFinish} from './get-time-to-finish';
import {inspectErrors} from './inspect-errors';
import {lambdaLs} from './io';
import type {EnhancedErrorInfo} from './write-lambda-error';

export const getProgress = async ({
	bucketName,
	renderId,
	expectedBucketOwner,
	region,
	memorySizeInMb,
	timeoutInMiliseconds,
}: {
	bucketName: string;
	renderId: string;
	expectedBucketOwner: string;
	region: AwsRegion;
	memorySizeInMb: number;
	timeoutInMiliseconds: number;
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
			bucketName
		);
		return {
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
				framesEncoded:
					postRenderData.renderMetadata.videoConfig.durationInFrames,
				totalFrames: postRenderData.renderMetadata.videoConfig.durationInFrames,
				doneIn: postRenderData.timeToEncode,
				timeToInvoke: postRenderData.timeToInvokeLambdas,
			},
			errors: postRenderData.errors,
			fatalErrorEncountered: false,
			lambdasInvoked: postRenderData.renderMetadata.totalChunks,
			outputFile: postRenderData.outputFile,
			renderId,
			renderMetadata: postRenderData.renderMetadata,
			timeToFinish: postRenderData.timeToFinish,
			timeToFinishChunks: postRenderData.timeToRenderChunks,
			timeToInvokeLambdas: postRenderData.timeToInvokeLambdas,
			overallProgress: 1,
			retriesInfo: postRenderData.retriesInfo,
			outKey: outData.key,
			outBucket: outData.renderBucketName,
			mostExpensiveFrameRanges: postRenderData.mostExpensiveFrameRanges ?? null,
		};
	}

	const contents = await lambdaLs({
		bucketName,
		prefix: rendersPrefix(renderId),
		region: getCurrentRegionInFunction(),
		expectedBucketOwner,
	});

	checkIfRenderExists(
		contents,
		renderId,
		bucketName,
		getCurrentRegionInFunction()
	);

	const renderMetadataExists = Boolean(
		contents.find((c) => c.Key === renderMetadataKey(renderId))
	);

	const [encodingStatus, renderMetadata, errorExplanations] = await Promise.all(
		[
			getEncodingMetadata({
				exists: Boolean(
					contents.find((c) => c.Key === encodingProgressKey(renderId))
				),
				bucketName,
				renderId,
				region: getCurrentRegionInFunction(),
				expectedBucketOwner,
			}),
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
		]
	);

	if (renderMetadata?.type === 'still') {
		throw new Error(
			"You don't need to call getRenderProgress() on a still render. Once you have obtained the `renderId`, the render is already done! 😉"
		);
	}

	const outputFile = renderMetadata
		? await findOutputFileInBucket({
				bucketName,
				renderMetadata,
				region,
		  })
		: null;

	const accruedSoFar = Number(
		estimatePriceFromBucket({
			contents,
			renderMetadata,
			memorySizeInMb,
			outputFileMetadata: outputFile,
			architecture: getCurrentArchitecture(),
			lambdasInvoked: renderMetadata?.estimatedRenderLambdaInvokations ?? 0,
			// We cannot determine the ephemeral storage size, so we
			// overestimate the price, but will only have a miniscule effect (~0.2%)
			diskSizeInMb: MAX_EPHEMERAL_STORAGE_IN_MB,
		})
	);

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
	const allChunks = chunks.length === (renderMetadata?.totalChunks ?? Infinity);
	const renderSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const lambdasInvokedStats = getLambdasInvokedStats({
		contents,
		renderId,
		estimatedRenderLambdaInvokations:
			renderMetadata?.estimatedRenderLambdaInvokations ?? null,
		startDate: renderMetadata?.startedDate ?? null,
		checkIfAllLambdasWereInvoked: true,
	});

	const retriesInfo = getRetryStats({
		contents,
		renderId,
	});

	const finalEncodingStatus = getFinalEncodingStatus({
		encodingStatus,
		outputFileExists: Boolean(outputFile),
		renderMetadata,
		lambdaInvokeStatus: lambdasInvokedStats,
	});

	const chunkCount = outputFile
		? renderMetadata?.totalChunks ?? 0
		: chunks.length;

	// We add a 20 second buffer for it, since AWS timeshifts can be quite a lot. Once it's 20sec over the limit, we consider it timed out
	const isBeyondTimeout =
		renderMetadata &&
		Date.now() > renderMetadata.startedDate + timeoutInMiliseconds + 20000;

	const allErrors: EnhancedErrorInfo[] = [
		isBeyondTimeout
			? ({
					attempt: 1,
					chunk: null,
					explanation: `The main function timed out after ${timeoutInMiliseconds}ms. Consider increasing the timeout of your function. You can use the "--timeout" parameter when deploying a function via CLI, or the "timeoutInSeconds" parameter when using the deployFunction API. ${DOCS_URL}/docs/lambda/cli/functions#deploy`,
					frame: null,
					isFatal: true,
					s3Location: '',
					stack: new Error().stack,
					tmpDir: null,
					totalAttempts: 1,
					type: 'stitcher',
					willRetry: false,
			  } as EnhancedErrorInfo)
			: null,
		...errorExplanations,
	].filter(Internals.truthy);

	return {
		chunks: chunkCount,
		done: false,
		encodingStatus,
		costs: formatCostsInfo(accruedSoFar),
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
		timeToInvokeLambdas:
			encodingStatus?.timeToInvoke ?? lambdasInvokedStats.timeToInvokeLambdas,
		overallProgress: getOverallProgress({
			cleanup: cleanup ? cleanup.filesDeleted / cleanup.minFilesToDelete : 0,
			encoding:
				finalEncodingStatus && renderMetadata
					? finalEncodingStatus.framesEncoded /
					  renderMetadata.videoConfig.durationInFrames
					: 0,
			invoking: renderMetadata
				? lambdasInvokedStats.lambdasInvoked /
				  renderMetadata.estimatedRenderLambdaInvokations
				: 0,
			rendering: renderMetadata ? chunkCount / renderMetadata.totalChunks : 0,
		}),
		retriesInfo,
		outKey:
			outputFile && renderMetadata
				? getExpectedOutName(renderMetadata, bucketName).key
				: null,
		outBucket:
			outputFile && renderMetadata
				? getExpectedOutName(renderMetadata, bucketName).renderBucketName
				: null,
		mostExpensiveFrameRanges: null,
	};
};
