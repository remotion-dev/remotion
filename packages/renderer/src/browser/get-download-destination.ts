import fs from 'node:fs';
import path from 'node:path';

export const getDownloadsCacheDir = () => {
	const cwd = process.cwd();
	let dir: string | undefined = cwd;
	for (;;) {
		try {
			if (fs.statSync(path.join(dir, 'package.json')).isFile()) {
				break;
			}
			// eslint-disable-next-line no-empty
		} catch (e) {}

		const parent = path.dirname(dir);
		if (dir === parent) {
			dir = undefined;
			break;
		}

		dir = parent;
	}

	if (!dir) {
		return path.resolve(cwd, '.remotion');
	}

	if (process.versions.pnp === '1') {
		return path.resolve(dir, '.pnp/.remotion');
	}

	if (process.versions.pnp === '3') {
		return path.resolve(dir, '.yarn/.remotion');
	}

	return path.resolve(dir, 'node_modules/.remotion');
};
