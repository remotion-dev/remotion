import {mkdirSync, mkdtempSync} from 'fs';
import {EFS_MOUNT_PATH, ENABLE_EFS} from './constants';
import {randomHash} from './helpers/random-hash';

const isLambda = Boolean(process.env.LAMBDA_TASK_ROOT);

export const tmpDir = (str: string) => {
	if (isLambda) {
		const dir = ENABLE_EFS
			? EFS_MOUNT_PATH + '/' + str + randomHash()
			: '/tmp/' + str + randomHash();
		mkdirSync(dir);

		return dir;
	}

	return mkdtempSync(str);
};
