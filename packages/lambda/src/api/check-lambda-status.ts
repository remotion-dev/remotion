import {callLambda} from '../shared/call-lambda';
import {LambdaRoutines} from '../shared/constants';

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
