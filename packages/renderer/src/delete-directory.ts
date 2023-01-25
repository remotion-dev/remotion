import execa from 'execa';
import fs from 'fs';
import {isServeUrl} from './is-serve-url';

export const deleteDirectory = async (directory: string): Promise<void> => {
	if (isServeUrl(directory)) {
		return;
	}

	if (process.platform === 'win32') {
		// We use del before to remove all files inside the directories otherwise
		// rmdir will throw an error.
		await execa('cmd', ['/c', 'del', '/f', '/s', '/q', directory]);
		try {
			await execa('cmd', ['/c', 'rmdir', '/s', '/q', directory]);
		} catch (err) {
			// Is not a directory
		}
	} else {
		await (fs.promises.rm ?? fs.promises.rmdir)(directory, {
			recursive: true,
		});
	}
};
