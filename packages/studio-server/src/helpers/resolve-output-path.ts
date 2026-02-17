import path from 'node:path';

export const resolveOutputPath = (
	remotionRoot: string,
	filePath: string,
): string => {
	const absolutePath = path.join(remotionRoot, filePath);

	const relativeToRoot = path.relative(remotionRoot, absolutePath);
	if (relativeToRoot.startsWith('..')) {
		throw new Error(`Not allowed to write to ${relativeToRoot}`);
	}

	return absolutePath;
};
