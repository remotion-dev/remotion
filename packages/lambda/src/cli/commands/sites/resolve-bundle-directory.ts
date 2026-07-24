import fs from 'node:fs';
import path from 'node:path';

export const resolveBundleDirectory = ({
	bundleDir,
	remotionRoot,
	currentWorkingDirectory,
}: {
	bundleDir: string | undefined;
	remotionRoot: string;
	currentWorkingDirectory: string;
}) => {
	if (bundleDir === undefined) {
		return path.resolve(remotionRoot, 'build');
	}

	const resolvedFromCwd = path.resolve(currentWorkingDirectory, bundleDir);
	if (fs.existsSync(resolvedFromCwd)) {
		return resolvedFromCwd;
	}

	return path.resolve(remotionRoot, bundleDir);
};
