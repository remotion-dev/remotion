import {deployLambda} from '../api/deploy-lambda';
import {ensureLambdaBinaries} from '../api/ensure-lambda-binaries';
import {DEFAULT_MEMORY_SIZE, DEFAULT_TIMEOUT} from '../shared/constants';
import {parsedLambdaCli} from './args';
import {getAwsRegion} from './get-aws-region';
import {Log} from './log';

export const DEPLOY_COMMAND = 'deploy';

export const deployCommand = async () => {
	const timeoutInSeconds = parsedLambdaCli.timeout ?? DEFAULT_TIMEOUT;
	const memorySize = parsedLambdaCli.memory ?? DEFAULT_MEMORY_SIZE;
	const {layerArn} = await ensureLambdaBinaries(getAwsRegion());
	const {functionName} = await deployLambda({
		region: getAwsRegion(),
		timeoutInSeconds,
		layerArn,
		memorySize,
	});
	Log.info(`Deployed to ${functionName}`);
};
