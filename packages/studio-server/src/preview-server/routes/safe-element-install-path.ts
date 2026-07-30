import {lstat, realpath} from 'node:fs/promises';
import path from 'node:path';

const isInside = ({child, parent}: {child: string; parent: string}) => {
	const relative = path.relative(parent, child);
	return (
		relative === '' ||
		(!relative.startsWith('..') && !path.isAbsolute(relative))
	);
};

const assertInsideProject = ({
	fileName,
	remotionRoot,
}: {
	fileName: string;
	remotionRoot: string;
}) => {
	if (!isInside({child: fileName, parent: remotionRoot})) {
		throw new Error(
			'Element installation must stay inside the Remotion project',
		);
	}
};

const getCanonicalProjectRoot = async (remotionRoot: string) => {
	return realpath(remotionRoot);
};

export const getSafeElementInstallPaths = async ({
	compositionFileName,
	elementFileName,
	remotionRoot,
}: {
	compositionFileName: string;
	elementFileName: string;
	remotionRoot: string;
}) => {
	const canonicalRoot = await getCanonicalProjectRoot(remotionRoot);
	const canonicalCompositionFile = await realpath(compositionFileName);
	assertInsideProject({
		fileName: canonicalCompositionFile,
		remotionRoot: canonicalRoot,
	});

	// The Element directory already exists because it is the composition file's
	// directory. Resolving it before appending the file name prevents writes
	// through a directory symlink that leaves the project.
	const canonicalElementDirectory = await realpath(
		path.dirname(elementFileName),
	);
	assertInsideProject({
		fileName: canonicalElementDirectory,
		remotionRoot: canonicalRoot,
	});

	const canonicalElementFile = path.join(
		canonicalElementDirectory,
		path.basename(elementFileName),
	);

	try {
		const elementStats = await lstat(canonicalElementFile);
		if (elementStats.isSymbolicLink()) {
			throw new Error('Element source file must not be a symbolic link');
		}

		if (!elementStats.isFile()) {
			throw new Error('Element source path must be a file');
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
			throw error;
		}
	}

	return {
		compositionFileName: canonicalCompositionFile,
		elementFileName: canonicalElementFile,
		remotionRoot: canonicalRoot,
	};
};
