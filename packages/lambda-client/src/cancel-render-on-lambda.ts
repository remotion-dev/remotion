import type {ProviderSpecifics} from '@remotion/serverless-client';
import {
	getOverallProgressFromStorage,
	writeCancellationSignal,
} from '@remotion/serverless-client';
import {awsImplementation, type AwsProvider} from './aws-provider';
import type {AwsRegion} from './regions';
import type {RequestHandler} from './types';

export type CancelRenderOnLambdaInput = {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
	forcePathStyle?: boolean;
	requestHandler?: RequestHandler;
};

type InternalCancelRenderOnLambdaInput = Omit<
	CancelRenderOnLambdaInput,
	'forcePathStyle' | 'requestHandler'
> & {
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
	providerSpecifics: ProviderSpecifics<AwsProvider>;
};

export const internalCancelRenderOnLambda = async (
	input: InternalCancelRenderOnLambdaInput,
): Promise<void> => {
	const expectedBucketOwner = await input.providerSpecifics.getAccountId({
		region: input.region,
	});
	const progress = await getOverallProgressFromStorage({
		bucketName: input.bucketName,
		expectedBucketOwner,
		region: input.region,
		renderId: input.renderId,
		providerSpecifics: input.providerSpecifics,
		forcePathStyle: input.forcePathStyle,
		requestHandler: input.requestHandler,
	});

	if (progress.cancellationEnabled !== true) {
		throw new Error(
			`Cannot cancel render ${input.renderId}: The render was not started with enableCancellation: true.`,
		);
	}

	await writeCancellationSignal({
		bucketName: input.bucketName,
		renderId: input.renderId,
		region: input.region,
		expectedBucketOwner,
		providerSpecifics: input.providerSpecifics,
		forcePathStyle: input.forcePathStyle,
		requestHandler: input.requestHandler,
	});
};

/*
 * @description Cancels an in-progress render that was started with enableCancellation: true.
 * @see [Documentation](https://remotion.dev/docs/lambda/cancelrenderonlambda)
 */
export const cancelRenderOnLambda = (
	input: CancelRenderOnLambdaInput,
): Promise<void> => {
	return internalCancelRenderOnLambda({
		...input,
		forcePathStyle: input.forcePathStyle ?? false,
		requestHandler: input.requestHandler ?? null,
		providerSpecifics: awsImplementation,
	});
};
