import type {AwsProvider} from '@remotion/lambda-client';
import {LambdaClientInternals} from '@remotion/lambda-client';
import type {
	OrError,
	ResponseStream,
	ServerlessPayload,
} from '@remotion/serverless';
import {
	innerHandler,
	ServerlessRoutines,
	streamWriter,
} from '@remotion/serverless';
import {serverAwsImplementation} from './aws-server-implementation';
import {setCurrentRequestId, stopLeakDetection} from './helpers/leak-detection';
import {streamifyResponse} from './helpers/streamify-response';

type LambdaRequestContext = {
	invokedFunctionArn: string;
	getRemainingTimeInMillis: () => number;
	awsRequestId: string;
};

export const routine = async (
	params: ServerlessPayload<AwsProvider>,
	responseStream: ResponseStream,
	context: LambdaRequestContext,
): Promise<void> => {
	const responseWriter = streamWriter(responseStream);

	const buffered =
		params.type === ServerlessRoutines.info ||
		params.type === ServerlessRoutines.start ||
		params.type === ServerlessRoutines.compositions;

	try {
		process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA = 'true';
		setCurrentRequestId(context.awsRequestId);
		stopLeakDetection();
		if (!context?.invokedFunctionArn) {
			throw new Error(
				'Lambda function unexpectedly does not have context.invokedFunctionArn',
			);
		}

		const expectedBucketOwner = context.invokedFunctionArn.split(':')[4];
		if (!expectedBucketOwner) {
			throw new Error('Expected current user ID');
		}

		await innerHandler({
			params,
			responseWriter,
			context: {
				requestId: context.awsRequestId,
				expectedBucketOwner,
				getRemainingTimeInMillis: () => context.getRemainingTimeInMillis(),
			},
			providerSpecifics: LambdaClientInternals.awsImplementation,
			insideFunctionSpecifics: serverAwsImplementation,
		});
	} catch (err) {
		if (!buffered) {
			throw err;
		}

		const response: OrError<0> = {
			type: 'error',
			message: (err as Error).message,
			stack: (err as Error).stack as string,
		};
		await responseWriter.write(
			new TextEncoder().encode(JSON.stringify(response)),
		);
		await responseWriter.end();
	}
};

export const handler = streamifyResponse(routine);
