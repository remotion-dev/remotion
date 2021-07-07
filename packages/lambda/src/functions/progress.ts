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

	return getProgress(
		lambdaParams.bucketName,
		lambdaParams.renderId,
		options.expectedBucketOwner
	);
};
