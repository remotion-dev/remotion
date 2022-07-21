import fs from 'fs';
import path from 'path';

type Environment = 'development' | 'production';

type CacheState = 'exists' | 'other-exists' | 'does-not-exist';

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

export const clearCache = () => {
	return (fs.promises.rm ?? fs.promises.rmdir)(getWebpackCacheDir(), {
		recursive: true,
	});
};

const getPrefix = (environment: Environment) => {
	return `remotion-v4-${environment}`;
};

export const getWebpackCacheName = (environment: Environment, hash: string) => {
	if (environment === 'development') {
		return `${getPrefix(environment)}-${hash}`;
	}

	// In production, the cache is independent from input props because
	// they are passed over URL params. Speed is mostly important in production.
	return `${getPrefix(environment)}-${hash}`;
};

const hasOtherCache = (environment: Environment) => {
	const cacheDir = fs.readdirSync(getWebpackCacheDir());
	if (
		cacheDir.find((c) => {
			return c.startsWith(getPrefix(environment));
		})
	) {
		return true;
	}

	return false;
};

export const cacheExists = (
	environment: Environment,
	hash: string
): CacheState => {
	if (fs.existsSync(remotionCacheLocation(environment, hash))) {
		return 'exists';
	}

	if (!fs.existsSync(getWebpackCacheDir())) {
		return 'does-not-exist';
	}

	if (hasOtherCache(environment)) {
		return 'other-exists';
	}

	return 'does-not-exist';
};
