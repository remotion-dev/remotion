import {LambdaPayload} from '../src/constants';
import {fireHandler} from './fire';
import {initHandler} from './init';
import {rendererHandler} from './renderer';

export const handler = async (params: LambdaPayload) => {
	console.log('CONTEXT', params);

	if (params.type === 'init') {
		return initHandler(params);
	} else if (params.type === 'fire') {
		return fireHandler(params);
	} else if (params.type === 'renderer') {
		return rendererHandler(params);
	} else {
		throw new Error('Command not found');
	}
};
