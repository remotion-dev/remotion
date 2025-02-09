import type {
	CloudProvider,
	GenericRenderProgress,
	ProviderSpecifics,
	ServerlessPayload,
} from '@remotion/serverless-client';
import {ServerlessRoutines, getProgress} from '@remotion/serverless-client';
import type {InsideFunctionSpecifics} from '../provider-implementation';
import {checkVersionMismatch} from './check-version-mismatch';

type Options<Provider extends CloudProvider> = {
	expectedBucketOwner: string;
	timeoutInMilliseconds: number;
	retriesRemaining: number;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
};

export const progressHandler = async <Provider extends CloudProvider>({
	params,
	options,
}: {
	params: ServerlessPayload<Provider>;
	options: Options<Provider>;
}): Promise<GenericRenderProgress<Provider>> => {
	if (params.type !== ServerlessRoutines.status) {
		throw new TypeError('Expected status type');
	}

	checkVersionMismatch({
		apiName: 'getRenderProgress()',
		insideFunctionSpecifics: options.insideFunctionSpecifics,
		params,
	});

	try {
		const progress = await getProgress({
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
