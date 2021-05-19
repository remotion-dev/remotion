import {createLambda} from '../create-lambda';
import {Log} from './log';

export const DEPLOY_COMMAND = 'deploy';

export const deployCommand = async () => {
	const {functionName} = await createLambda();
	Log.info(`Deployed to ${functionName}`);
};
