import {createLambda} from '../create-lambda';

export const DEPLOY_COMMAND = 'deploy';

export const deployCommand = async () => {
	await createLambda();
};
