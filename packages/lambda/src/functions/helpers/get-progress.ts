import {AwsRegion} from '../..';
import {
	chunkKey,
	encodingProgressKey,
	renderMetadataKey,
	RenderProgress,
	rendersPrefix,
} from '../../shared/constants';
import {calculateChunkTimes} from './calculate-chunk-times';
import {estimatePriceFromBucket} from './calculate-price-from-bucket';
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
import {getTimeToFinish} from './get-time-to-finish';
import {inspectErrors} from './inspect-errors';
import {lambdaLs} from './io';
import {isFatalError} from './is-fatal-error';

export const getProgress = async ({
	bucketName,
	renderId,
	expectedBucketOwner,
	region,
	memorySizeInMb,
}: {
	bucketName: string;
	renderId: string;
	expectedBucketOwner: string;
	region: AwsRegion;
	memorySizeInMb: number;
}): Promise<RenderProgress> => {
	const postRenderData = await getPostRenderData({
		bucketName,
		region,
		renderId,
		expectedBucketOwner,
	});

	if (postRenderData) {
		return {
			bucket: bucketName,
			renderSize: postRenderData.renderSize,
			chunks: postRenderData.renderMetadata.totalChunks,
			cleanup: {
				doneIn: postRenderData.timeToCleanUp,
				filesDeleted: postRenderData.filesCleanedUp,
				filesToDelete: postRenderData.filesCleanedUp,
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
		};
	}

	const contents = await lambdaLs({
		bucketName,
		prefix: rendersPrefix(renderId),
		region: getCurrentRegionInFunction(),
		expectedBucketOwner,
	});

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
			getRenderMetadata({
				exists: Boolean(
					contents.find((c) => c.Key === renderMetadataKey(renderId))
				),
				bucketName,
				renderId,
				region: getCurrentRegionInFunction(),
				expectedBucketOwner,
			}),
			inspectErrors({
				contents,
				renderId,
				bucket: bucketName,
				region: getCurrentRegionInFunction(),
				expectedBucketOwner,
			}),
		]
	);

	const accruedSoFar = Number(
		estimatePriceFromBucket({
			renderId,
			contents,
			renderMetadata,
			bucketName,
			memorySizeInMb,
		})
	);

	const outputFile = findOutputFileInBucket({
		bucketName,
		contents,
		renderMetadata,
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
	const allChunks = chunks.length === (renderMetadata?.totalChunks ?? Infinity);
	const renderSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const lambdasInvokedStats = getLambdasInvokedStats(
		contents,
		renderId,
		renderMetadata?.estimatedRenderLambdaInvokations ?? null,
		renderMetadata?.startedDate ?? null
	);

	const finalEncodingStatus = getFinalEncodingStatus({
		encodingStatus,
		outputFileExists: Boolean(outputFile),
		renderMetadata,
		lambdaInvokeStatus: lambdasInvokedStats,
	});

	const chunkCount = outputFile
		? renderMetadata?.totalChunks ?? 0
		: chunks.length;
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
		errors: errorExplanations,
		fatalErrorEncountered: errorExplanations.some(isFatalError),
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
			cleanup: cleanup ? cleanup.filesDeleted / cleanup.filesToDelete : 0,
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
	};
};
