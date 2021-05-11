import {LambdaPayload, LambdaRoutines} from '../src/constants';
import {fireHandler} from '../src/functions/fire';
import {progressHandler} from '../src/functions/get-progress';
import {launchHandler} from '../src/functions/launch';
import {rendererHandler} from '../src/functions/renderer';
import {startHandler} from '../src/functions/start';
import {LambdaReturnValues} from '../src/return-values';

export const handler = async <T extends LambdaRoutines>(
	params: LambdaPayload
): Promise<LambdaReturnValues[T]> => {
	console.log('CONTEXT', params);
	if (params.type === LambdaRoutines.start) {
		return startHandler(params);
	}

	if (params.type === LambdaRoutines.launch) {
		return launchHandler(params);
	}

	if (params.type === LambdaRoutines.status) {
		return progressHandler(params);
	}

	if (params.type === LambdaRoutines.fire) {
		return fireHandler(params);
	}

	if (params.type === LambdaRoutines.renderer) {
		return rendererHandler(params);
	}

	throw new Error('Command not found');
};
