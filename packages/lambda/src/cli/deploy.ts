import {deployLambda} from '../api/deploy-lambda';
import {getAwsRegion} from './get-aws-region';
import {Log} from './log';

export const DEPLOY_COMMAND = 'deploy';

export const deployCommand = async () => {
	const {functionName} = await deployLambda({region: getAwsRegion()});
	Log.info(`Deployed to ${functionName}`);
};
