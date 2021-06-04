import {simulatePermissions} from '../iam-validation/simulate';
import {suggestedPolicy} from '../iam-validation/suggested-policy';
import {Log} from './log';

export const infoCommand = async () => {
	try {
		await simulatePermissions();
	} catch (err) {
		Log.error('Did not have the required permissions on AWS:');
		Log.error(err);
		Log.info('We suggest the following policy:');

		Log.info(JSON.stringify(suggestedPolicy, null, 2));
	}
};
