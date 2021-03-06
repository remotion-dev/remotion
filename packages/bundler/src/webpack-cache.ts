import fs from 'fs';
import path from 'path';

type Environment = 'development' | 'production';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessVersions {
			pnp?: string;
		}
	}
}

// Inlined from https://github.com/webpack/webpack/blob/4c2ee7a4ddb8db2362ca83b6c4190523387ba7ee/lib/config/defaults.js#L265
// An algorithm to determine where Webpack will cache the depencies
export const getWebpackCacheDir = () => {
	const cwd = process.cwd();
	let dir: string | undefined = cwd;
	for (;;) {
		try {
			if (fs.statSync(path.join(dir, 'package.json')).isFile()) break;
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
		return path.resolve(cwd, '.cache/webpack');
	} else if (process.versions.pnp === '1') {
		return path.resolve(dir, '.pnp/.cache/webpack');
	} else if (process.versions.pnp === '3') {
		return path.resolve(dir, '.yarn/.cache/webpack');
	} else {
		return path.resolve(dir, 'node_modules/.cache/webpack');
	}
};

export const getWebpackCacheName = (environment: Environment) => {
	return `remotion-${environment}`;
};

export const cacheExists = (environment: Environment) => {
	return fs.existsSync(
		path.join(getWebpackCacheDir(), getWebpackCacheName(environment))
	);
};
