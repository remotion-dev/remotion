import {
	suggestedPolicy,
	suggestedRolePolicy,
} from '../iam-validation/suggested-policy';
import {Log} from './log';

export const POLICIES_COMMAND = 'policies';

export const policiesCommand = (args: string[]) => {
	Log.info('Policy for user:');
	Log.info(JSON.stringify(suggestedPolicy, null, 2));

	Log.info('Policy for role:');
	Log.info(JSON.stringify(suggestedRolePolicy, null, 2));
};
