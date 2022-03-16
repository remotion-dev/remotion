import {_Object} from '@aws-sdk/client-s3';
import {estimatePrice} from '../../api/estimate-price';
import {AwsRegion} from '../../pricing/aws-regions';
import {
	lambdaTimingsPrefix,
	PostRenderData,
	RenderMetadata,
} from '../../shared/constants';
import {parseLambdaTimingsKey} from '../../shared/parse-lambda-timings-key';
import {calculateChunkTimes} from './calculate-chunk-times';
import {OutputFileMetadata} from './find-output-file-in-bucket';
import {getFilesToDelete} from './get-files-to-delete';
import {getLambdasInvokedStats} from './get-lambdas-invoked-stats';
import {getRetryStats} from './get-retry-stats';
import {getTimeToFinish} from './get-time-to-finish';
import {EnhancedErrorInfo} from './write-lambda-error';

const OVERHEAD_TIME_PER_LAMBDA = 100;

export const createPostRenderData = async ({
	renderId,
	region,
	memorySizeInMb,
	renderMetadata,
	contents,
	timeToEncode,
	errorExplanations,
	timeToDelete,
	outputFile,
}: {
	renderId: string;
	expectedBucketOwner: string;
	region: AwsRegion;
	memorySizeInMb: number;
	renderMetadata: RenderMetadata;
	contents: _Object[];
	timeToEncode: number;
	timeToDelete: number;
	errorExplanations: EnhancedErrorInfo[];
	outputFile: OutputFileMetadata;
}) => {
	const initializedKeys = contents.filter((c) =>
		c.Key?.startsWith(lambdaTimingsPrefix(renderId))
	);

	const parsedTimings = initializedKeys.map(({Key}) =>
		parseLambdaTimingsKey(Key as string)
	);

	const times = parsedTimings
		.map((p) => p.rendered - p.start + OVERHEAD_TIME_PER_LAMBDA)
		.reduce((a, b) => a + b);

	const cost = estimatePrice({
		durationInMiliseconds: times,
		memorySizeInMb,
		region,
	});

	if (!outputFile) {
		throw new Error('Cannot wrap up without an output file in the S3 bucket.');
	}

	const endTime = Date.now();

	const timeToFinish = getTimeToFinish({
		renderMetadata,
		lastModified: endTime,
	});

	if (!timeToFinish) {
		throw new TypeError(`Cannot calculate timeToFinish value`);
	}

	const renderSize = contents
		.map((c) => c.Size ?? 0)
		.reduce((a, b) => a + b, 0);

	const {timeToInvokeLambdas} = getLambdasInvokedStats(
		contents,
		renderId,
		renderMetadata?.estimatedRenderLambdaInvokations ?? null,
		renderMetadata.startedDate
	);
	const retriesInfo = getRetryStats({contents, renderId});

	if (timeToInvokeLambdas === null) {
		throw new Error('should have timing for all lambdas');
	}

	const data: PostRenderData = {
		cost: {
			currency: 'USD',
			disclaimer:
				'Estimated cost for lambda invocations only. Does not include cost for S3 storage and data transfer.',
			estimatedCost: cost,
			estimatedDisplayCost: new Intl.NumberFormat('en-US', {
				currency: 'USD',
				currencyDisplay: 'narrowSymbol',
			}).format(cost),
		},
		outputFile: outputFile.url,
		timeToFinish,
		errors: errorExplanations,
		startTime: renderMetadata.startedDate,
		endTime,
		outputSize: outputFile.size,
		renderSize,
		renderMetadata,
		filesCleanedUp: getFilesToDelete({
			chunkCount: renderMetadata.totalChunks,
			renderId,
		}).length,
		timeToEncode,
		timeToCleanUp: timeToDelete,
		timeToRenderChunks: calculateChunkTimes({
			contents,
			renderId,
			type: 'absolute-time',
		}),
		timeToInvokeLambdas,
		retriesInfo,
	};

	return data;
};
