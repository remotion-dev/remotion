import {AwsRegion} from '../pricing/aws-regions';
import {callLambda} from '../shared/call-lambda';
import {LambdaRoutines} from '../shared/constants';

export const getRenderProgress = async ({
	functionName,
	bucketName,
	renderId,
	region,
}: {
	functionName: string;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
}) => {
	return callLambda({
		functionName,
		type: LambdaRoutines.status,
		payload: {
			bucketName,
			renderId,
		},
		region,
	});
};
