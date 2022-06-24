import type {AwsRegion} from '../../client';
import type {LambdaRoutines} from '../../shared/constants';

export const getCloudwatchStreamUrl = ({
	region,
	functionName,
	method,
	renderId,
}: {
	region: AwsRegion;
	functionName: string;
	method: LambdaRoutines;
	renderId: string;
}) => {
	return `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logsV2:log-groups/log-group/$252Faws$252Flambda$252F${functionName}/log-events$3FfilterPattern$3D$2522method$253D${method}$252CrenderId$253D${renderId}$2522`;
};
