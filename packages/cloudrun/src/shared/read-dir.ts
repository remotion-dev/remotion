import * as fs from 'fs';
import * as path from 'path';
import {getEtagOfFile} from './get-etag';

// Function to recursively read a directory and return a list of files
// with their etags and file names
export async function readDirectory({
	dir,
	etags,
	originalDir,
}: {
	dir: string;
	etags: {[key: string]: string};
	originalDir: string;
}) {
	const files = fs.readdirSync(dir);

	for (const file of files) {
		if (file.startsWith('.DS_Store')) continue;

		const filePath = path.join(dir, file);

		if (fs.lstatSync(filePath).isDirectory()) {
			etags = {
				...etags,
				...(await readDirectory({dir: filePath, etags, originalDir})),
			};
			continue;
		}

		 
		if (fs.lstatSync(filePath).isSymbolicLink()) {
			const realPath = fs.realpathSync(filePath);

			etags[path.relative(originalDir, filePath)] =
				await getEtagOfFile(realPath);
		} else {
			etags[path.relative(originalDir, filePath)] =
				await getEtagOfFile(filePath);
		}
	}

	// Return the list of files with their etags and file names
	return etags;
}
