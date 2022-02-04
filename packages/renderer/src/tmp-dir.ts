import fs from 'fs';
import {mkdirSync} from 'fs';
import os from 'os';
import path from 'path';
import {Internals} from 'remotion';

const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

const randomHash = (): string => {
	return new Array(10)
		.fill(1)
		.map(() => {
			return alphabet[Math.floor(Math.random() * alphabet.length)];
		})
		.join('');
};

export const tmpDir = (str: string) => {
	if (Internals.isInLambda()) {
		const dir = '/tmp/' + str + randomHash();

		if (fs.existsSync(dir)) {
			(fs.rmSync ?? fs.rmdirSync)(dir, {
				recursive: true,
				force: true,
			});
		}

		mkdirSync(dir);
		return dir;
	}

	const newDir = path.join(os.tmpdir(), str + randomHash());
	mkdirSync(newDir);
	return newDir;
};
