import {
	chunkKey,
	encodingProgressKey,
	lambdaInitializedPrefix,
	outName,
	renderMetadataKey,
	RenderProgress,
	rendersPrefix,
} from '../../shared/constants';
import {calculatePriceFromBucket} from './calculate-price-from-bucket';
import {findOutputFileInBucket} from './find-output-file-in-bucket';
import {getCleanupProgress} from './get-cleanup-progress';
import {getCurrentRegion} from './get-current-region';
import {getEncodingMetadata} from './get-encoding-metadata';
import {getFinalEncodingStatus} from './get-final-encoding-status';
import {getRenderMetadata} from './get-render-metadata';
import {getTimeToFinish} from './get-time-to-finish';
import {inspectErrors} from './inspect-errors';
import {lambdaLs} from './io';
import {isFatalError} from './is-fatal-error';

export const getProgress = async (
	bucketName: string,
	renderId: string,
	expectedBucketOwner: string
): Promise<RenderProgress> => {
	const contents = await lambdaLs({
		bucketName,
		prefix: rendersPrefix(renderId),
		region: getCurrentRegion(),
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
				region: getCurrentRegion(),
			}),
			getRenderMetadata({
				exists: Boolean(
					contents.find((c) => c.Key === renderMetadataKey(renderId))
				),
				bucketName,
				renderId,
				region: getCurrentRegion(),
			}),
			inspectErrors({
				contents,
				renderId,
				bucket: bucketName,
				region: getCurrentRegion(),
			}),
		]
	);

	const accruedSoFar = Number(
		calculatePriceFromBucket(renderId, contents, renderMetadata)
	);

	const output = renderMetadata
		? contents.find((c) =>
				c.Key?.includes(outName(renderId, renderMetadata.codec))
		  ) ?? null
		: null;

	const outputFile = findOutputFileInBucket({
		bucketName,
		output,
		renderId,
		renderMetadata,
	});

	const cleanup = getCleanupProgress({
		chunkCount: renderMetadata?.totalChunks ?? 0,
		contents,
		output: outputFile,
		renderId,
	});

	const timeToFinish = getTimeToFinish({
		output,
		renderMetadata,
	});

	const chunks = contents.filter((c) => c.Key?.startsWith(chunkKey(renderId)));

	const bucketSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const lambdasInvoked = outputFile
		? renderMetadata?.totalChunks ?? 0
		: contents.filter((c) =>
				c.Key?.startsWith(lambdaInitializedPrefix(renderId))
		  ).length;

	return {
		chunks: outputFile ? renderMetadata?.totalChunks ?? 0 : chunks.length,
		done: Boolean(output && cleanup?.done),
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
		renderId,
		renderMetadata,
		bucket: bucketName,
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
