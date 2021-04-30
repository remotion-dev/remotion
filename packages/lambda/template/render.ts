import {LambdaPayload, LambdaRoutines} from '../src/constants';
import {fireHandler} from '../src/fire';
import {progressHandler} from '../src/get-progress';
import {launchHandler} from '../src/launch';
import {rendererHandler} from '../src/renderer';
import {LambdaReturnValues} from '../src/return-values';
import {startHandler} from '../src/start';

export const handler = async <T extends LambdaRoutines>(
	params: LambdaPayload
): Promise<LambdaReturnValues[T]> => {
	console.log('CONTEXT', params);
	if (params.type === LambdaRoutines.start) {
		return startHandler(params);
	} else if (params.type === LambdaRoutines.launch) {
		return launchHandler(params);
	} else if (params.type === LambdaRoutines.status) {
		return progressHandler(params);
	} else if (params.type === LambdaRoutines.fire) {
		return fireHandler(params);
	} else if (params.type === LambdaRoutines.renderer) {
		return rendererHandler(params);
	} else {
		throw new Error('Command not found');
	}
};
