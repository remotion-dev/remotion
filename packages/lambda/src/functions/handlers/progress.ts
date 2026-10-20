import {
	LambdaClientInternals,
	ServerlessRoutines,
	type GenericRenderProgress,
	type ProviderSpecifics,
	type ServerlessPayload,
} from '@remotion/lambda-client';
import type {InsideFunctionSpecifics} from '../provider-implementation';
import {checkVersionMismatch} from './check-version-mismatch';

type Options = {
	expectedBucketOwner: string | null;
	timeoutInMilliseconds: number;
	retriesRemaining: number;
	providerSpecifics: ProviderSpecifics;
	insideFunctionSpecifics: InsideFunctionSpecifics;
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
		insideFunctionSpecifics: options.insideFunctionSpecifics,
		params,
	});

	try {
		const progress = await LambdaClientInternals.getProgress({
			bucketName: params.bucketName,
			renderId: params.renderId,
			expectedBucketOwner: options.expectedBucketOwner,
			region: options.insideFunctionSpecifics.getCurrentRegionInFunction(),
			memorySizeInMb:
				options.insideFunctionSpecifics.getCurrentMemorySizeInMb(),
			timeoutInMilliseconds: options.timeoutInMilliseconds,
			customCredentials: params.s3OutputProvider ?? null,
			providerSpecifics: options.providerSpecifics,
			forcePathStyle: params.forcePathStyle,
			functionName: options.insideFunctionSpecifics.getCurrentFunctionName(),
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
					timeoutInMilliseconds: options.timeoutInMilliseconds,
					retriesRemaining: options.retriesRemaining - 1,
					providerSpecifics: options.providerSpecifics,
					insideFunctionSpecifics: options.insideFunctionSpecifics,
				},
			});
		}

		throw err;
	}
};
