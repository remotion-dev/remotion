import {VERSION} from 'remotion/version';
import type {LambdaPayload, RenderProgress} from '../shared/constants';
import {LambdaRoutines} from '../shared/constants';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {getProgress} from './helpers/get-progress';

type Options = {
	expectedBucketOwner: string;
	timeoutInMilliseconds: number;
};

export const progressHandler = (
	lambdaParams: LambdaPayload,
	options: Options
): Promise<RenderProgress> => {
	if (lambdaParams.type !== LambdaRoutines.status) {
		throw new TypeError('Expected status type');
	}

	if (lambdaParams.version !== VERSION) {
		if (!lambdaParams.version) {
			throw new Error(
				`Version mismatch: When calling getRenderProgress(), you called the function ${process.env.AWS_LAMBDA_FUNCTION_NAME} which has the version ${VERSION} but the @remotion/lambda package is an older version. Deploy a new function and use it to call getRenderProgress(). See: https://www.remotion.dev/docs/lambda/upgrading`
			);
		}

		throw new Error(
			`Version mismatch: When calling getRenderProgress(), you passed ${process.env.AWS_LAMBDA_FUNCTION_NAME} as the function, which has the version ${VERSION}, but the @remotion/lambda package you used to invoke the function has version ${lambdaParams.version}. Deploy a new function and use it to call getRenderProgress(). See: https://www.remotion.dev/docs/lambda/upgrading`
		);
	}

	return getProgress({
		bucketName: lambdaParams.bucketName,
		renderId: lambdaParams.renderId,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		timeoutInMilliseconds: options.timeoutInMilliseconds,
		customCredentials: lambdaParams.s3OutputProvider ?? null,
	});
};
