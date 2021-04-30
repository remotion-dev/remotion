import {LambdaPayload} from '../src/constants';
import {fireHandler} from './fire';
import {initHandler} from './init';
import {rendererHandler} from './renderer';

export const handler = async (params: LambdaPayload) => {
	console.log('CONTEXT', params);

	if (params.type === 'init') {
		await initHandler(params);
	} else if (params.type === 'fire') {
		await fireHandler(params);
	} else if (params.type === 'renderer') {
		await rendererHandler(params);
	} else {
		throw new Error('Command not found');
	}
};
