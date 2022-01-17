import path from 'path';
import fs from 'fs';

const allowedFileExtensions = ['js', 'ts', 'tsx', 'jsx', 'map', 'mjs'];

export const getFileSource = (p: string): Promise<string> => {
	if (!allowedFileExtensions.find((extension) => p.endsWith(extension))) {
		throw new Error(`Not allowed to open ${p}`);
	}

	const resolved = path.resolve(process.cwd(), p);
	const relativeToProcessCwd = path.relative(process.cwd(), resolved);
	if (relativeToProcessCwd.startsWith('..')) {
		throw new Error(`Not allowed to open ${relativeToProcessCwd}`);
	}

	return fs.promises.readFile(p, 'utf-8');
};
