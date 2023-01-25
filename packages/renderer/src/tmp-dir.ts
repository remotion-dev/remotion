import fs, {mkdirSync} from 'fs';
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

export const tmpDir = (str: string) => {
	const newDir = path.join(os.tmpdir(), str + randomHash());

	if (fs.existsSync(newDir)) {
		(fs.rmSync ?? fs.rmdirSync)(newDir, {
			recursive: true,
			force: true,
		});
	}

	mkdirSync(newDir);
	return newDir;
};
