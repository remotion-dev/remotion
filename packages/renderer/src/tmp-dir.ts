import fs, {mkdirSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

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
	const newDir = path.join(os.tmpdir(), str + randomHash());

	if (fs.existsSync(newDir)) {
		fs.rmSync(newDir, {
			recursive: true,
			force: true,
		});
	}

	mkdirSync(newDir);
	return newDir;
};
