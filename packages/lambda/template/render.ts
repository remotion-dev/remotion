import {
	LambdaPayload,
	LambdaReturnValues,
	LambdaRoutines,
} from '../src/constants';
import {fireHandler} from '../src/fire';
import {progressHandler} from '../src/get-progress';
import {launchHandler} from '../src/launch';
import {rendererHandler} from '../src/renderer';
import {startHandler} from '../src/start';

export const handler = async <T extends LambdaRoutines>(
	params: LambdaPayload
): Promise<LambdaReturnValues[T]> => {
	console.log('CONTEXT', params);
	if (params.type === 'start') {
		return startHandler(params);
	} else if (params.type === 'launch') {
		return launchHandler(params);
	} else if (params.type === 'status') {
		return progressHandler(params);
	} else if (params.type === 'fire') {
		return fireHandler(params);
	} else if (params.type === 'renderer') {
		return rendererHandler(params);
	} else {
		throw new Error('Command not found');
	}
};
