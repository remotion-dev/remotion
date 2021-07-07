import {AwsRegion} from '../..';
import {calculatePrice} from '../../pricing/calculate-price';
import {
	lambdaTimingsPrefix,
	outName,
	PostRenderData,
	RenderMetadata,
	rendersPrefix,
} from '../../shared/constants';
import {parseLambdaTimingsKey} from '../../shared/parse-lambda-timings-key';
import {findOutputFileInBucket} from './find-output-file-in-bucket';
import {inspectErrors} from './inspect-errors';
import {lambdaLs} from './io';

const OVERHEAD_TIME_PER_LAMBDA = 100;

export const createPostRenderData = async ({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
	memorySize,
	renderMetadata,
}: {
	renderId: string;
	bucketName: string;
	expectedBucketOwner: string;
	region: AwsRegion;
	memorySize: number;
	renderMetadata: RenderMetadata;
}) => {
	const contents = await lambdaLs({
		bucketName,
		prefix: rendersPrefix(renderId),
		expectedBucketOwner,
		region,
	});

	const initializedKeys = contents.filter((c) =>
		c.Key?.startsWith(lambdaTimingsPrefix(renderId))
	);

	const parsedTimings = initializedKeys.map(({Key}) =>
		parseLambdaTimingsKey(Key as string)
	);

	const times = parsedTimings
		.map((p) => p.end - p.start + OVERHEAD_TIME_PER_LAMBDA)
		.reduce((a, b) => a + b);

	const cost = calculatePrice({
		durationInMiliseconds: times,
		memorySize,
		region,
	});

	const output =
		contents.find((c) =>
			c.Key?.includes(outName(renderId, renderMetadata.codec))
		) ?? null;

	if (!output) {
		throw new Error(
			'Could not find output file. Not yet ready to call createPostRenderData()'
		);
	}

	const outputFile = findOutputFileInBucket({
		output,
		bucketName,
		renderId,
		renderMetadata,
	});

	if (!outputFile) {
		throw new Error('Cannot wrap up without an output file in the S3 bucket.');
	}

	const errorExplanations = await inspectErrors({
		contents,
		renderId,
		bucket: bucketName,
		region,
	});

	const endTime = Date.now();
	const startTime = renderMetadata.startedDate;
	const timeToFinish = endTime - startTime;

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
		outputFile,
		timeToFinish,
		errors: errorExplanations,
		startTime: renderMetadata.startedDate,
		endTime,
		outputSize: output.Size as number,
	};

	return data;
};
