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
				`Version mismatch: When calling getRenderProgress(), the deployed Lambda function had version ${VERSION} but the @remotion/lambda package is an older version. Align the versions.`
			);
		}

		throw new Error(
			`Version mismatch: When calling getRenderProgress(), get deployed Lambda function had version ${VERSION} and the @remotion/lambda package has version ${lambdaParams.version}. Align the versions.`
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
