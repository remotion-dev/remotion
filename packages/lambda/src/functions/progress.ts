import type {CloudProvider, ProviderSpecifics} from '@remotion/serverless';
import type {ServerlessPayload} from '@remotion/serverless/client';
import {ServerlessRoutines} from '@remotion/serverless/client';
import {VERSION} from 'remotion/version';
import type {GenericRenderProgress} from '../shared/constants';
import {getProgress} from './helpers/get-progress';

type Options<Provider extends CloudProvider, Region extends string> = {
	expectedBucketOwner: string;
	timeoutInMilliseconds: number;
	retriesRemaining: number;
	providerSpecifics: ProviderSpecifics<Provider, Region>;
};

export const progressHandler = async <
	Provider extends CloudProvider,
	Region extends string,
>(
	lambdaParams: ServerlessPayload<Region>,
	options: Options<Provider, Region>,
): Promise<GenericRenderProgress<Provider, Region>> => {
	if (lambdaParams.type !== ServerlessRoutines.status) {
		throw new TypeError('Expected status type');
	}

	if (lambdaParams.version !== VERSION) {
		if (!lambdaParams.version) {
			throw new Error(
				`Version mismatch: When calling getRenderProgress(), you called the function ${process.env.AWS_LAMBDA_FUNCTION_NAME} which has the version ${VERSION} but the @remotion/lambda package is an older version. Deploy a new function and use it to call getRenderProgress(). See: https://www.remotion.dev/docs/lambda/upgrading`,
			);
		}

		throw new Error(
			`Version mismatch: When calling getRenderProgress(), you passed ${process.env.AWS_LAMBDA_FUNCTION_NAME} as the function, which has the version ${VERSION}, but the @remotion/lambda package you used to invoke the function has version ${lambdaParams.version}. Deploy a new function and use it to call getRenderProgress(). See: https://www.remotion.dev/docs/lambda/upgrading`,
		);
	}

	try {
		const progress = await getProgress({
			bucketName: lambdaParams.bucketName,
			renderId: lambdaParams.renderId,
			expectedBucketOwner: options.expectedBucketOwner,
			region: options.providerSpecifics.getCurrentRegionInFunction(),
			memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
			timeoutInMilliseconds: options.timeoutInMilliseconds,
			customCredentials: lambdaParams.s3OutputProvider ?? null,
			providerSpecifics: options.providerSpecifics,
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
			return progressHandler(lambdaParams, {
				expectedBucketOwner: options.expectedBucketOwner,
				timeoutInMilliseconds: options.timeoutInMilliseconds,
				retriesRemaining: options.retriesRemaining - 1,
				providerSpecifics: options.providerSpecifics,
			});
		}

		throw err;
	}
};
