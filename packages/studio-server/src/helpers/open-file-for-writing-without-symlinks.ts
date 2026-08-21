import fs from 'node:fs';
import path from 'node:path';

const assertNoSymlinks = ({
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
}: {
	rootDirectory: string;
	absolutePath: string;
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

	return fs.openSync(
		resolvedAbsolutePath,
		fs.constants.O_CREAT |
			fs.constants.O_WRONLY |
			fs.constants.O_TRUNC |
			fs.constants.O_NOFOLLOW,
	);
};
