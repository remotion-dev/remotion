import {getAwsRegion} from '../cli/get-aws-region';
import {
	LambdaPayload,
	LambdaRoutines,
	RenderProgress,
} from '../shared/constants';
import {getProgress} from './helpers/get-progress';

type Options = {
	expectedBucketOwner: string;
};

export const progressHandler = async (
	lambdaParams: LambdaPayload,
	options: Options
): Promise<RenderProgress> => {
	if (lambdaParams.type !== LambdaRoutines.status) {
		throw new TypeError('Expected status type');
	}

	return getProgress({
		bucketName: lambdaParams.bucketName,
		renderId: lambdaParams.renderId,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getAwsRegion(),
		memorySize: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
	});
};
