import {RenderInternals} from '@remotion/renderer';
import type {LambdaPayload} from '../shared/constants';
import {COMMAND_NOT_FOUND, LambdaRoutines} from '../shared/constants';
import {compositionsHandler} from './compositions';
import {deleteTmpDir} from './helpers/clean-tmpdir';
import {getWarm, setWarm} from './helpers/is-warm';
import {printCloudwatchHelper} from './helpers/print-cloudwatch-helper';
import type {ResponseStream} from './helpers/streamify-response';
import {streamifyResponse} from './helpers/streamify-response';
import {infoHandler} from './info';
import {launchHandler} from './launch';
import {progressHandler} from './progress';
import {rendererHandler} from './renderer';
import {startHandler} from './start';
import {stillHandler} from './still';
import {randomHash} from '../shared/random-hash';
import type {OrError} from '../shared/return-values';

const innerHandler = async (
	params: LambdaPayload,
	responseStream: ResponseStream,
	context: {
		invokedFunctionArn: string;
		getRemainingTimeInMillis: () => number;
	}
): Promise<void> => {
	process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA = 'true';
	const timeoutInMilliseconds = context.getRemainingTimeInMillis();

	if (!context?.invokedFunctionArn) {
		throw new Error(
			'Lambda function unexpectedly does not have context.invokedFunctionArn'
		);
	}

	deleteTmpDir();
	const isWarm = getWarm();
	setWarm();

	const currentUserId = context.invokedFunctionArn.split(':')[4];
	if (params.type === LambdaRoutines.still) {
		const renderId = randomHash({randomInTests: true});

		printCloudwatchHelper(LambdaRoutines.still, {
			renderId,
			inputProps: JSON.stringify(params.inputProps),
			isWarm,
		});
		const response = await stillHandler(params, renderId, {
			expectedBucketOwner: currentUserId,
		});
		responseStream.write(JSON.stringify(response));
		responseStream.end();

		return;
	}

	if (params.type === LambdaRoutines.start) {
		printCloudwatchHelper(LambdaRoutines.start, {
			inputProps: JSON.stringify(params.inputProps),
			isWarm,
		});
		const response = await startHandler(params, {
			expectedBucketOwner: currentUserId,
		});
		responseStream.write(JSON.stringify(response));
		responseStream.end();
		return;
	}

	if (params.type === LambdaRoutines.launch) {
		printCloudwatchHelper(LambdaRoutines.launch, {
			renderId: params.renderId,
			inputProps: JSON.stringify(params.inputProps),
			isWarm,
		});
		await launchHandler(params, {
			expectedBucketOwner: currentUserId,
			getRemainingTimeInMillis: context.getRemainingTimeInMillis,
		});
		responseStream.end();
		return;
	}

	if (params.type === LambdaRoutines.status) {
		printCloudwatchHelper(LambdaRoutines.status, {
			renderId: params.renderId,
			isWarm,
		});
		const response = await progressHandler(params, {
			expectedBucketOwner: currentUserId,
			timeoutInMilliseconds,
		});
		responseStream.write(JSON.stringify(response));
		responseStream.end();
		return;
	}

	if (params.type === LambdaRoutines.renderer) {
		printCloudwatchHelper(LambdaRoutines.renderer, {
			renderId: params.renderId,
			chunk: String(params.chunk),
			dumpLogs: String(
				RenderInternals.isEqualOrBelowLogLevel(params.logLevel, 'verbose')
			),
			resolvedProps: JSON.stringify(params.resolvedProps),
			isWarm,
		});
		await rendererHandler(params, {
			expectedBucketOwner: currentUserId,
			isWarm,
		});
		responseStream.end();
		return;
	}

	if (params.type === LambdaRoutines.info) {
		printCloudwatchHelper(LambdaRoutines.info, {
			isWarm,
		});

		const response = await infoHandler(params);
		responseStream.write(JSON.stringify(response));
		responseStream.end();
		return;
	}

	if (params.type === LambdaRoutines.compositions) {
		printCloudwatchHelper(LambdaRoutines.compositions, {
			isWarm,
		});

		const response = await compositionsHandler(params, {
			expectedBucketOwner: currentUserId,
		});
		responseStream.write(JSON.stringify(response));
		responseStream.end();
		return;
	}

	throw new Error(COMMAND_NOT_FOUND);
};

const routine = async (
	params: LambdaPayload,
	responseStream: ResponseStream,
	context: {
		invokedFunctionArn: string;
		getRemainingTimeInMillis: () => number;
	}
): Promise<void> => {
	try {
		await innerHandler(params, responseStream, context);
	} catch (err) {
		const res: OrError<0> = {
			type: 'error',
			message: (err as Error).message,
			stack: (err as Error).stack as string,
		};

		responseStream.write(JSON.stringify(res));
		responseStream.end();
	}
};

export const handler = streamifyResponse(routine);
