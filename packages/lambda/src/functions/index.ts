import {
	COMMAND_NOT_FOUND,
	LambdaPayload,
	LambdaRoutines,
} from '../shared/constants';
import {LambdaReturnValues} from '../shared/return-values';
import {fireHandler} from './fire';
import {progressHandler} from './get-progress';
import {deleteTmpDir} from './helpers/clean-tmpdir';
import {infoHandler} from './info';
import {launchHandler} from './launch';
import {rendererHandler} from './renderer';
import {startHandler} from './start';

export const handler = async <T extends LambdaRoutines>(
	params: LambdaPayload,
	context: {invokedFunctionArn: string}
): Promise<LambdaReturnValues[T]> => {
	if (!context || !context.invokedFunctionArn) {
		throw new Error(
			'Lambda function unexpectedly does not have context.invokedFunctionArn'
		);
	}

	const currentUserId = context.invokedFunctionArn.split(':')[4];
	deleteTmpDir();
	if (params.type === LambdaRoutines.start) {
		return startHandler(params);
	}

	if (params.type === LambdaRoutines.launch) {
		return launchHandler(params, {expectedBucketOwner: currentUserId});
	}

	if (params.type === LambdaRoutines.status) {
		return progressHandler(params, {expectedBucketOwner: currentUserId});
	}

	if (params.type === LambdaRoutines.fire) {
		return fireHandler(params);
	}

	if (params.type === LambdaRoutines.renderer) {
		return rendererHandler(params, {expectedBucketOwner: currentUserId});
	}

	if (params.type === LambdaRoutines.info) {
		return infoHandler(params);
	}

	throw new Error(COMMAND_NOT_FOUND);
};
