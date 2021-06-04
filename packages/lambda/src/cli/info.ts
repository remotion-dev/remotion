import {simulatePermissions} from '../iam-validation/simulate';

export const infoCommand = async () => {
	await simulatePermissions();
};
