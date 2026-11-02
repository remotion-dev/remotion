import {
	LambdaClientInternals,
	ServerlessRoutines,
	type GenericRenderProgress,
	type ServerlessPayload,
} from '@remotion/lambda-client';
import {getCurrentFunctionName} from '../helpers/get-current-function-name';
import {getCurrentRegionInFunction} from '../helpers/get-current-region';
import {checkVersionMismatch} from './check-version-mismatch';

type Options = {
	expectedBucketOwner: string | null;
	retriesRemaining: number;
};

export const progressHandler = async ({
	params,
	options,
}: {
	params: ServerlessPayload;
	options: Options;
}): Promise<GenericRenderProgress> => {
	if (params.type !== ServerlessRoutines.status) {
		throw new TypeError('Expected status type');
	}

	checkVersionMismatch({
		apiName: 'getRenderProgress()',
		params,
	});

	try {
		const progress = await LambdaClientInternals.getProgress({
			bucketName: params.bucketName,
			renderId: params.renderId,
			expectedBucketOwner: options.expectedBucketOwner,
			region: getCurrentRegionInFunction(),
			customCredentials: params.s3OutputProvider ?? null,
			forcePathStyle: params.forcePathStyle,
			functionName: getCurrentFunctionName(),
			requestHandler: null,
		});
		return progress;
	} catch (err) {
		if (options.retriesRemaining === 0) {
			throw err;
		}

		if ((err as Error).message.includes('No render with ID')) {
			await new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
			return progressHandler({
				params,
				options: {
					expectedBucketOwner: options.expectedBucketOwner,
					retriesRemaining: options.retriesRemaining - 1,
				},
			});
		}

		throw err;
	}
};
