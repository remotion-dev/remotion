import {lstatSync, statSync} from 'node:fs';
import path from 'node:path';

export const validateOutputPath = ({
	outputPath,
	type,
}: {
	outputPath: string;
	type: 'file' | 'directory';
}) => {
	const absolutePath = path.resolve(outputPath);
	let currentPath = absolutePath;

	while (true) {
		const stat = statSync(currentPath, {throwIfNoEntry: false});
		if (stat) {
			if (currentPath === absolutePath) {
				if (type === 'directory' && !stat.isDirectory()) {
					throw new Error(
						`Cannot download an image sequence to "${absolutePath}": the path exists and is not a directory. Choose an output directory.`,
					);
				}

				if (type === 'file' && !stat.isFile()) {
					throw new Error(
						`Cannot download a file to "${absolutePath}": the path exists and is not a file. Choose an output filename.`,
					);
				}
			} else if (!stat.isDirectory()) {
				throw new Error(
					`Cannot download to "${absolutePath}": parent path "${currentPath}" exists and is not a directory.`,
				);
			}

			return;
		}

		let isSymbolicLink = false;
		try {
			isSymbolicLink =
				lstatSync(currentPath, {throwIfNoEntry: false})?.isSymbolicLink() ??
				false;
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code !== 'ENOTDIR') {
				throw err;
			}
		}

		if (isSymbolicLink) {
			throw new Error(
				`Cannot download to "${absolutePath}": "${currentPath}" is a symbolic link whose target does not exist.`,
			);
		}

		const parentPath = path.dirname(currentPath);
		if (parentPath === currentPath) {
			return;
		}

		currentPath = parentPath;
	}
};
