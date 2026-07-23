import {execSync} from 'node:child_process';
import http from 'node:http';
import https from 'node:https';

const DEFAULT_REGISTRY = 'https://registry.npmjs.org';
const packageJson = require('../package.json') as {version: string};

const getRegistry = (): string => {
	try {
		const registry = execSync('npm config get registry', {
			encoding: 'utf-8',
			timeout: 10_000,
			stdio: ['pipe', 'pipe', 'pipe'],
		}).trim();

		if (registry && registry !== 'undefined') {
			return registry.replace(/\/$/, '');
		}
	} catch {
		// Fall through to default
	}

	return DEFAULT_REGISTRY;
};

const getPackageJsonForRemotion = (registry: string): Promise<string> => {
	const url = `${registry}/remotion`;
	const client = url.startsWith('https') ? https : http;

	return new Promise<string>((resolve, reject) => {
		const req = client.get(
			url,
			{
				headers: {
					accept:
						'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*',
				},
			},
			(res) => {
				let data = '';

				res.on('data', (d) => {
					data += d;
				});

				res.on('end', () => resolve(data));
			},
		);

		req.on('error', (error) => {
			reject(error);
		});

		req.end();
	});
};

type GetLatestRemotionVersionOptions = {
	getRegistry?: () => string;
	getPackageJsonForRemotion?: (registry: string) => Promise<string>;
	fallbackVersion?: string;
	onError?: (message: string) => void;
};

const parseLatestVersion = (pkgJson: string) => {
	const latest = JSON.parse(pkgJson)['dist-tags']?.latest;
	if (typeof latest !== 'string') {
		throw new Error('The response did not include dist-tags.latest.');
	}

	return latest;
};

const stringifyError = (error: unknown) => {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
};

export const getLatestRemotionVersion = async ({
	getRegistry: getRegistryOption = getRegistry,
	getPackageJsonForRemotion:
		getPackageJsonForRemotionOption = getPackageJsonForRemotion,
	fallbackVersion = packageJson.version,
	onError,
}: GetLatestRemotionVersionOptions = {}) => {
	const registry = getRegistryOption();
	try {
		const pkgJson = await getPackageJsonForRemotionOption(registry);
		return parseLatestVersion(pkgJson);
	} catch (err) {
		onError?.(
			`Could not fetch the latest Remotion version from ${registry} (${stringifyError(
				err,
			)}). Continuing with ${fallbackVersion}.`,
		);
		return fallbackVersion;
	}
};
