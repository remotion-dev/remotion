import {mkdirSync, mkdtempSync} from 'fs';
import {EFS_MOUNT_PATH, ENABLE_EFS} from './constants';

const isLambda = Boolean(process.env.LAMBDA_TASK_ROOT);

export const tmpDir = (str: string) => {
	if (isLambda) {
		const dir = ENABLE_EFS
			? EFS_MOUNT_PATH + '/' + str + Math.random()
			: '/tmp/' + str + Math.random();
		mkdirSync(dir);
		return dir;
	}

	return mkdtempSync(str);
};
