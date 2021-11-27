import {mkdirSync} from 'fs';
import os from 'os';
import path from 'path';

const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

const randomHash = (): string => {
	return new Array(10)
		.fill(1)
		.map(() => {
			return alphabet[Math.floor(Math.random() * alphabet.length)];
		})
		.join('');
};

const isInLambda = Boolean(process.env.LAMBDA_TASK_ROOT);

export const tmpDir = (str: string) => {
	if (isInLambda) {
		const dir = '/tmp/' + str + randomHash();
		mkdirSync(dir);
		return dir;
	}

	const newDir = path.join(os.tmpdir(), str + randomHash());
	mkdirSync(newDir);
	return newDir;
};
