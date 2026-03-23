import {execSync} from 'node:child_process';
import http from 'node:http';
import https from 'node:https';

const DEFAULT_REGISTRY = 'https://registry.npmjs.org';

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

const getPackageJsonForRemotion = (): Promise<string> => {
	const registry = getRegistry();
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

export const getLatestRemotionVersion = async () => {
	const pkgJson = await getPackageJsonForRemotion();
	try {
		return JSON.parse(pkgJson)['dist-tags'].latest;
	} catch {
		const registry = getRegistry();
		throw new Error(
			`Failed to fetch the latest Remotion version from ${registry}. ` +
				`The response was not valid JSON. ` +
				`If you are behind a corporate proxy, make sure your npm registry is configured correctly ` +
				`(npm config set registry <your-registry-url>).`,
		);
	}
};
