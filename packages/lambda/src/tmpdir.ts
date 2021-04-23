import {mkdirSync, mkdtempSync} from 'fs';

const isLambda = !!process.env.LAMBDA_TASK_ROOT;

export const tmpDir = (str: string) => {
	if (isLambda) {
		const dir = '/tmp/' + str + Math.random();
		mkdirSync(dir);
		return dir;
	}
	return mkdtempSync(str);
};
