import fs from 'fs';
import path from 'path';

const allowedFileExtensions = ['js', 'ts', 'tsx', 'jsx', 'map', 'mjs'];

export const getFileSource = (
	remotionRoot: string,
	p: string
): Promise<string> => {
	if (!allowedFileExtensions.find((extension) => p.endsWith(extension))) {
		throw new Error(`Not allowed to open ${p}`);
	}

	const resolved = path.resolve(remotionRoot, p);
	const relativeToProcessCwd = path.relative(remotionRoot, resolved);
	if (relativeToProcessCwd.startsWith('..')) {
		throw new Error(`Not allowed to open ${relativeToProcessCwd}`);
	}

	return fs.promises.readFile(p, 'utf-8');
};
