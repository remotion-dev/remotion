// Must run before any other module is evaluated.
import './helpers/set-lambda-env';
import {
	ServerlessRoutines,
	type OrError,
	type ServerlessPayload,
} from '@remotion/lambda-client';
import {setCurrentRequestId, stopLeakDetection} from './helpers/leak-detection';
import {streamifyResponse} from './helpers/streamify-response';
import {innerHandler} from './inner-routine';
import type {ResponseStream} from './streaming/response-stream';
import {streamWriter} from './streaming/stream-writer';

type LambdaRequestContext = {
	invokedFunctionArn: string;
	getRemainingTimeInMillis: () => number;
	awsRequestId: string;
};

export const routine = async (
	params: ServerlessPayload,
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
