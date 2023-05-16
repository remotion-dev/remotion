import fs from 'node:fs';
import path from 'node:path';

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
