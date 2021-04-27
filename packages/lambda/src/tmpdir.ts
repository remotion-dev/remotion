import {mkdirSync, mkdtempSync} from 'fs';
import {EFS_MOUNT_PATH} from './constants';

const isLambda = !!process.env.LAMBDA_TASK_ROOT;

export const tmpDir = (str: string) => {
	if (isLambda) {
		const dir = EFS_MOUNT_PATH + '/' + str + Math.random();
		mkdirSync(dir);
		return dir;
	}
	return mkdtempSync(str);
};
