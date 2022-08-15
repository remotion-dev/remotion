import fs from 'fs';
import path from 'path';

export function mkdirp(dir: string) {
	const parent = path.dirname(dir);
	if (parent === dir) return;

	mkdirp(parent);

	try {
		fs.mkdirSync(dir);
	} catch (err) {
		if ((err as {code: string}).code !== 'EEXIST') throw err;
	}
}
