import type {AwsProvider} from '@remotion/lambda-client';
import {LambdaClientInternals} from '@remotion/lambda-client';
import type {
	RequestContext,
	ResponseStream,
	ServerlessPayload,
} from '@remotion/serverless';
import {
	innerHandler,
	innerRoutine,
	ServerlessRoutines,
	streamWriter,
} from '@remotion/serverless';
import {serverAwsImplementation} from './aws-server-implementation';
import {streamifyResponse} from './helpers/streamify-response';

export const routine = (
	params: ServerlessPayload<AwsProvider>,
	responseStream: ResponseStream,
	context: RequestContext,
): Promise<void> => {
	const responseWriter = streamWriter(responseStream);

	const handle =
		params.type === ServerlessRoutines.info ||
		params.type === ServerlessRoutines.start ||
		params.type === ServerlessRoutines.compositions
			? innerRoutine
			: innerHandler;

	return handle({
		params,
		responseWriter,
		context,
		providerSpecifics: LambdaClientInternals.awsImplementation,
		insideFunctionSpecifics: serverAwsImplementation,
	});
};

export const handler = streamifyResponse(routine);
