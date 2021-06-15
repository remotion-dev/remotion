import {callLambda} from '../shared/call-lambda';
import {LambdaRoutines} from '../shared/constants';

export const getRenderProgress = async ({
	functionName,
	bucketName,
	renderId,
}: {
	functionName: string;
	bucketName: string;
	renderId: string;
}) => {
	return callLambda({
		functionName,
		type: LambdaRoutines.status,
		payload: {
			bucketName,
			renderId,
		},
	});
};
