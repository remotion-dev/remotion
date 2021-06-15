import {mkdirSync, mkdtempSync} from 'fs';
import {randomHash} from './helpers/random-hash';

const isLambda = Boolean(process.env.LAMBDA_TASK_ROOT);

export const tmpDir = (str: string) => {
	if (isLambda) {
		const dir = '/tmp/' + str + randomHash();
		mkdirSync(dir);

		return dir;
	}

	return mkdtempSync(str);
};
