import {deployLambda} from '../api/deploy-lambda';
import {ensureLambdaBinaries} from '../api/ensure-lambda-binaries';
import {getAwsRegion} from './get-aws-region';
import {Log} from './log';

export const DEPLOY_COMMAND = 'deploy';

export const deployCommand = async () => {
	// TODO: Unhardcode timeout
	const TIMEOUT_HARDCODED = 120;
	// TODO: Unhardcode memory
	const MEMORY_SIZE = 1024;
	const {layerArn} = await ensureLambdaBinaries(getAwsRegion());
	const {functionName} = await deployLambda({
		region: getAwsRegion(),
		timeoutInSeconds: TIMEOUT_HARDCODED,
		layerArn,
		memorySize: MEMORY_SIZE,
	});
	Log.info(`Deployed to ${functionName}`);
};
