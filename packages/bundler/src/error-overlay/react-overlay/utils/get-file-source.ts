import path from 'path';
import fs from 'fs';

export const getFileSource = (p: string): Promise<string> => {
	const resolved = path.resolve(process.cwd(), p);
	const relativeToProcessCwd = path.relative(process.cwd(), resolved);
	if (relativeToProcessCwd.startsWith('..')) {
		throw new Error(`Not allowed to open ${relativeToProcessCwd}`);
	}

	return fs.promises.readFile(p, 'utf-8');
};
