import fs from 'node:fs';
import path from 'node:path';

const allowedFileExtensions = ['js', 'ts', 'tsx', 'jsx', 'map', 'mjs'];

// Must be async function for proper error handling
export const getFileSource = (
	remotionRoot: string,
	p: string,
): Promise<string> => {
	if (!allowedFileExtensions.find((extension) => p.endsWith(extension))) {
		return Promise.reject(new Error(`Not allowed to open ${p}`));
	}

	const resolved = path.resolve(remotionRoot, p);
	const relativeToRemotionRoot = path.relative(remotionRoot, resolved);
	if (
		relativeToRemotionRoot === '..' ||
		relativeToRemotionRoot.startsWith(`..${path.sep}`) ||
		path.isAbsolute(relativeToRemotionRoot)
	) {
		return Promise.reject(
			new Error(`Not allowed to open ${relativeToRemotionRoot}`),
		);
	}

	return fs.promises.readFile(resolved, 'utf-8');
};
