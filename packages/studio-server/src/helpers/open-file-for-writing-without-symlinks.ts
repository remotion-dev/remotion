import fs from 'node:fs';
import path from 'node:path';

export const assertNoSymlinks = ({
	rootDirectory,
	absolutePath,
}: {
	rootDirectory: string;
	absolutePath: string;
}) => {
	const relativePath = path.relative(rootDirectory, absolutePath);
	if (
		relativePath === '..' ||
		relativePath.startsWith(`..${path.sep}`) ||
		path.isAbsolute(relativePath)
	) {
		throw new Error(`Not allowed to write to ${relativePath}`);
	}

	let pathToCheck = rootDirectory;
	for (const segment of relativePath.split(path.sep)) {
		pathToCheck = path.join(pathToCheck, segment);

		try {
			if (fs.lstatSync(pathToCheck).isSymbolicLink()) {
				throw new Error(
					`Not allowed to write through symbolic link ${pathToCheck}`,
				);
			}
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
				break;
			}

			throw error;
		}
	}
};

export const openFileForWritingWithoutSymlinks = ({
	rootDirectory,
	absolutePath,
	exclusive,
}: {
	rootDirectory: string;
	absolutePath: string;
	exclusive: boolean;
}) => {
	const resolvedRootDirectory = path.resolve(rootDirectory);
	const resolvedAbsolutePath = path.resolve(absolutePath);

	assertNoSymlinks({
		rootDirectory: resolvedRootDirectory,
		absolutePath: resolvedAbsolutePath,
	});
	fs.mkdirSync(path.dirname(resolvedAbsolutePath), {recursive: true});
	assertNoSymlinks({
		rootDirectory: resolvedRootDirectory,
		absolutePath: resolvedAbsolutePath,
	});

	const flags =
		process.platform === 'win32'
			? exclusive
				? 'wx'
				: 'w'
			: fs.constants.O_CREAT |
				fs.constants.O_WRONLY |
				(exclusive ? fs.constants.O_EXCL : fs.constants.O_TRUNC) |
				fs.constants.O_NOFOLLOW;

	return fs.openSync(resolvedAbsolutePath, flags);
};
