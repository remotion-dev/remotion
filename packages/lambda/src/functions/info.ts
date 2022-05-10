import {
	CURRENT_VERSION,
	LambdaPayload,
	LambdaRoutines,
	LambdaVersions,
} from '../shared/constants';

export const infoHandler = (lambdaParams: LambdaPayload) => {
	if (lambdaParams.type !== LambdaRoutines.info) {
		throw new TypeError('Expected info type');
	}

	const returnValue: {
		version: LambdaVersions;
	} = {
		version: CURRENT_VERSION,
	};

	return Promise.resolve(returnValue);
};
