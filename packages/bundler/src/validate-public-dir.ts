import fs from 'node:fs';
import path from 'node:path';

export const validatePublicDir = (p: string) => {
	const {root} = path.parse(process.cwd());

	if (p === root) {
		throw new Error(
			`The public directory was specified as "${p}", which is the root directory. This is not allowed.`,
		);
	}

	try {
		const stat = fs.lstatSync(p);
		if (!stat.isDirectory()) {
			throw new Error(
				`The public directory was specified as "${p}", and while this path exists on the filesystem, it is not a directory.`,
			);
		}
	} catch {
		// Path does not exist
		// Check if the parent path exists
		const parentPath = path.dirname(p);
		const exists = fs.existsSync(parentPath);
		if (!exists) {
			throw new Error(
				`The public directory was specified as "${p}", but this folder does not exist and the parent directory "${parentPath}" does also not exist. Create at least the parent directory.`,
			);
		}
	}
};
