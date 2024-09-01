import * as fs from 'node:fs';
import * as path from 'node:path';
import {getEtagOfFile} from './get-etag';

// Function to recursively read a directory and return a list of files
// with their etags and file names
export function readDirectory({
	dir,
	etags,
	originalDir,
	onProgress,
}: {
	dir: string;
	etags: {[key: string]: () => Promise<string>};
	originalDir: string;
	onProgress: (bytes: number) => void;
}) {
	const files = fs.readdirSync(dir);

	for (const file of files) {
		if (file.startsWith('.DS_Store')) continue;

		const filePath = path.join(dir, file);

		if (fs.lstatSync(filePath).isDirectory()) {
			etags = {
				...etags,
				...readDirectory({
					dir: filePath,
					etags,
					originalDir,
					onProgress,
				}),
			};
			continue;
		}

		// eslint-disable-next-line no-lonely-if
		if (fs.lstatSync(filePath).isSymbolicLink()) {
			const realPath = fs.realpathSync(filePath);

			etags[path.relative(originalDir, filePath)] = getEtagOfFile(
				realPath,
				onProgress,
			);
		} else {
			etags[path.relative(originalDir, filePath)] = getEtagOfFile(
				filePath,
				onProgress,
			);
		}
	}

	// Return the list of files with their etags and file names
	return etags;
}
