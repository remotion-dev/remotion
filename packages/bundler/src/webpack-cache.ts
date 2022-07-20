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
const getWebpackCacheDir = () => {
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
		return path.resolve(cwd, '.cache/webpack');
	}

	if (process.versions.pnp === '1') {
		return path.resolve(dir, '.pnp/.cache/webpack');
	}

	if (process.versions.pnp === '3') {
		return path.resolve(dir, '.yarn/.cache/webpack');
	}

	return path.resolve(dir, 'node_modules/.cache/webpack');
};

const remotionCacheLocation = (environment: Environment, hash: string) => {
	return path.join(
		getWebpackCacheDir(),
		getWebpackCacheName(environment, hash)
	);
};

export const clearCache = (environment: Environment, hash: string) => {
	return (fs.promises.rm ?? fs.promises.rmdir)(
		remotionCacheLocation(environment, hash),
		{
			recursive: true,
		}
	);
};

export const getWebpackCacheName = (environment: Environment, hash: string) => {
	if (environment === 'development') {
		return `remotion-v3-${environment}-${hash}`;
	}

	// In production, the cache is independent from input props because
	// they are passed over URL params. Speed is mostly important in production.
	return `remotion-v3-${environment}-${hash}`;
};

export const cacheExists = (environment: Environment, hash: string) => {
	return fs.existsSync(remotionCacheLocation(environment, hash));
};
