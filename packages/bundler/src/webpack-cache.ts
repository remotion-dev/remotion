import fs from 'node:fs';
import path from 'node:path';

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
const getWebpackCacheDir = (remotionRoot: string) => {
	let dir: string | undefined = remotionRoot;
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
		return path.resolve(remotionRoot, '.cache/webpack');
	}

	if (process.versions.pnp === '1') {
		return path.resolve(dir, '.pnp/.cache/webpack');
	}

	if (process.versions.pnp === '3') {
		return path.resolve(dir, '.yarn/.cache/webpack');
	}

	return path.resolve(dir, 'node_modules/.cache/webpack');
};

const remotionCacheLocationForEnv = (
	remotionRoot: string,
	environment: Environment
) => {
	return path.join(
		getWebpackCacheDir(remotionRoot),
		getWebpackCacheEnvDir(environment)
	);
};

const remotionCacheLocation = (
	remotionRoot: string,
	environment: Environment,
	hash: string
) => {
	return path.join(
		getWebpackCacheDir(remotionRoot),
		getWebpackCacheName(environment, hash)
	);
};

export const clearCache = (remotionRoot: string, env: Environment) => {
	return fs.promises.rm(remotionCacheLocationForEnv(remotionRoot, env), {
		recursive: true,
	});
};

const getPrefix = (environment: Environment) => {
	return `remotion-v5-${environment}`;
};

export const getWebpackCacheEnvDir = (environment: Environment) => {
	return getPrefix(environment);
};

export const getWebpackCacheName = (environment: Environment, hash: string) => {
	return [getWebpackCacheEnvDir(environment), hash].join(path.sep);
};

const hasOtherCache = ({
	remotionRoot,
	environment,
}: {
	remotionRoot: string;
	environment: Environment;
}) => {
	const cacheDir = fs.readdirSync(getWebpackCacheDir(remotionRoot));
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
	remotionRoot: string,
	environment: Environment,
	hash: string
): CacheState => {
	if (fs.existsSync(remotionCacheLocation(remotionRoot, environment, hash))) {
		return 'exists';
	}

	if (!fs.existsSync(getWebpackCacheDir(remotionRoot))) {
		return 'does-not-exist';
	}

	if (hasOtherCache({remotionRoot, environment})) {
		return 'other-exists';
	}

	return 'does-not-exist';
};
