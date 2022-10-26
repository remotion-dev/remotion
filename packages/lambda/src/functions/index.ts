import {RenderInternals} from '@remotion/renderer';
import type {LambdaPayload} from '../shared/constants';
import {COMMAND_NOT_FOUND, LambdaRoutines} from '../shared/constants';
import type {LambdaReturnValues} from '../shared/return-values';
import {deleteTmpDir} from './helpers/clean-tmpdir';
import {getWarm, setWarm} from './helpers/is-warm';
import {printCloudwatchHelper} from './helpers/print-cloudwatch-helper';
import {infoHandler} from './info';
import {launchHandler} from './launch';
import {progressHandler} from './progress';
import {rendererHandler} from './renderer';
import {startHandler} from './start';
import {stillHandler} from './still';

export const handler = async <T extends LambdaRoutines>(
	params: LambdaPayload,
	context: {invokedFunctionArn: string; getRemainingTimeInMillis: () => number}
): Promise<LambdaReturnValues[T]> => {
	process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA = 'true';
	const timeoutInMilliseconds = context.getRemainingTimeInMillis();

	if (!context || !context.invokedFunctionArn) {
		throw new Error(
			'Lambda function unexpectedly does not have context.invokedFunctionArn'
		);
	}

	deleteTmpDir();
	const isWarm = getWarm();
	setWarm();

	const currentUserId = context.invokedFunctionArn.split(':')[4];
	if (params.type === LambdaRoutines.still) {
		printCloudwatchHelper(LambdaRoutines.still, {
			inputProps: JSON.stringify(params.inputProps),
			isWarm,
		});
		return stillHandler(params, {
			expectedBucketOwner: currentUserId,
		});
	}

	if (params.type === LambdaRoutines.start) {
		printCloudwatchHelper(LambdaRoutines.start, {
			inputProps: JSON.stringify(params.inputProps),
			isWarm,
		});
		return startHandler(params, {expectedBucketOwner: currentUserId});
	}

	if (params.type === LambdaRoutines.launch) {
		printCloudwatchHelper(LambdaRoutines.launch, {
			renderId: params.renderId,
			inputProps: JSON.stringify(params.inputProps),
			isWarm,
		});
		return launchHandler(params, {
			expectedBucketOwner: currentUserId,
			getRemainingTimeInMillis: context.getRemainingTimeInMillis,
		});
	}

	if (params.type === LambdaRoutines.status) {
		printCloudwatchHelper(LambdaRoutines.status, {
			renderId: params.renderId,
			isWarm,
		});
		return progressHandler(params, {
			expectedBucketOwner: currentUserId,
			timeoutInMilliseconds,
		});
	}

	if (params.type === LambdaRoutines.renderer) {
		printCloudwatchHelper(LambdaRoutines.renderer, {
			renderId: params.renderId,
			chunk: String(params.chunk),
			dumpLogs: String(
				RenderInternals.isEqualOrBelowLogLevel(params.logLevel, 'verbose')
			),
			inputProps: JSON.stringify(params.inputProps),
			isWarm,
		});
		return rendererHandler(params, {
			expectedBucketOwner: currentUserId,
			isWarm,
		});
	}

	if (params.type === LambdaRoutines.info) {
		printCloudwatchHelper(LambdaRoutines.info, {
			isWarm,
		});

		return infoHandler(params);
	}

	throw new Error(COMMAND_NOT_FOUND);
};
