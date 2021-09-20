import {existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync} from 'fs';
import {join, normalize} from 'path';

export const deleteRecursively = (directory: string) => {
	function remove(dir: string) {
		readdirSync(dir).forEach((file) => {
			const current = join(dir, file);

			if (lstatSync(current).isDirectory()) {
				remove(current);
			} else {
				unlinkSync(current);
			}
		});

		rmdirSync(directory);
	}

	directory = normalize(directory);

	if (!existsSync(directory)) {
		return false;
	}

	remove(directory);
	return true;
};
