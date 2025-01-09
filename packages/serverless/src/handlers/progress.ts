import type {ServerlessPayload} from '../constants';
import {ServerlessRoutines} from '../constants';
import {getProgress} from '../progress';
import type {
	InsideFunctionSpecifics,
	ProviderSpecifics,
} from '../provider-implementation';
import type {GenericRenderProgress} from '../render-progress';
import type {CloudProvider} from '../types';
import {checkVersionMismatch} from './check-version-mismatch';

type Options<Provider extends CloudProvider> = {
	expectedBucketOwner: string;
	timeoutInMilliseconds: number;
	retriesRemaining: number;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics;
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
			region: options.providerSpecifics.getCurrentRegionInFunction(),
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
