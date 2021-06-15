import {deployLambda} from '../api/deploy-lambda';
import {Log} from './log';

export const DEPLOY_COMMAND = 'deploy';

export const deployCommand = async () => {
	const {functionName} = await deployLambda();
	Log.info(`Deployed to ${functionName}`);
};
