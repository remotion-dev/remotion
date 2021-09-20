import {deployFunction as original} from '../deploy-function';
import {isLayerEnsured} from './mock-layers';

export const deployFunction: typeof original = async (input) => {
	if (!isLayerEnsured(input.region)) {
		throw new TypeError('did not ensure layer for ' + input.region);
	}

	return Promise.resolve({
		functionName: 'hithere',
	});
};
