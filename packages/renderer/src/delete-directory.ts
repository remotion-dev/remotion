import execa from 'execa';
import fs, {existsSync} from 'fs';
import {isServeUrl} from './is-serve-url';

export const deleteDirectory = (directory: string): void => {
	if (isServeUrl(directory)) {
		return;
	}

	if (!existsSync(directory)) {
		return;
	}

	if (process.platform === 'win32') {
		// We use del before to remove all files inside the directories otherwise
		// rmdir will throw an error.
		execa.sync('cmd', ['/c', 'del', '/f', '/s', '/q', directory]);
		try {
			execa.sync('cmd', ['/c', 'rmdir', '/s', '/q', directory]);
		} catch (err) {
			// Is not a directory
		}
	} else {
		(fs.rmSync ?? fs.rmdirSync)(directory, {
			recursive: true,
		});
	}
};
