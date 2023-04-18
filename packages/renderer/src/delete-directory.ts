import fs, {existsSync} from 'fs';
import {isServeUrl} from './is-serve-url';

export const deleteDirectory = (directory: string): void => {
	if (isServeUrl(directory)) {
		return;
	}

	if (!existsSync(directory)) {
		return;
	}

	// TODO: Test it on Windows to see if it deletes the bundle
	fs.rmSync(directory, {
		recursive: true,
	});
};
