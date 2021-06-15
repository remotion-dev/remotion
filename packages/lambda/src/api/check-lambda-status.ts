import {callLambda} from '../call-lambda';
import {LambdaRoutines} from '../constants';

export const checkLambdaStatus = async (
	functionName: string,
	bucketName: string,
	renderId: string
) => {
	return callLambda({
		functionName,
		type: LambdaRoutines.status,
		payload: {
			bucketName,
			renderId,
		},
	});
};
