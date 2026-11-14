import https from 'https';
import fs from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import * as tar from 'tar';
import {mkdirp} from './mkdirp';

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_IN_MS = 30_000;

const fetchWithRedirects = ({
	url,
	dest,
	redirectsLeft,
}: {
	url: string;
	dest: string;
	redirectsLeft: number;
}): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		let timeout: ReturnType<typeof setTimeout> | null = null;
		let request: ReturnType<typeof https.get> | null = null;

		const clearRequestTimeout = () => {
			if (timeout !== null) {
				clearTimeout(timeout);
				timeout = null;
			}
		};

		const resetRequestTimeout = () => {
			clearRequestTimeout();
			timeout = setTimeout(() => {
				request?.destroy(
					new Error(
						`Network request to ${url} timed out after ${REQUEST_TIMEOUT_IN_MS}ms without receiving data`,
					),
				);
			}, REQUEST_TIMEOUT_IN_MS);
		};

		let active = true;

		const deactivate = () => {
			active = false;
			clearRequestTimeout();
		};

		const clientRequest = https.get(url, (response) => {
			const code = response.statusCode as number;
			response.on('error', (err) => {
				if (active) {
					reject(err);
				}
			});
			response.on('data', () => {
				if (active) {
					resetRequestTimeout();
				}
			});

			if (code >= 400) {
				deactivate();
				response.resume();
				reject(
					new Error(
						`Network request to ${url} failed with code ${code} (${response.statusMessage})`,
					),
				);
			} else if (code >= 300) {
				const {location} = response.headers;
				if (!location) {
					deactivate();
					response.resume();
					reject(
						new Error(
							`Network request to ${url} was redirected without a location header`,
						),
					);
					return;
				}

				if (redirectsLeft === 0) {
					deactivate();
					response.resume();
					reject(
						new Error(
							`Network request to ${url} was redirected more than ${MAX_REDIRECTS} times`,
						),
					);
					return;
				}

				let nextUrl: string;
				try {
					nextUrl = new URL(location, url).toString();
				} catch {
					deactivate();
					response.resume();
					reject(
						new Error(
							`Network request to ${url} was redirected to an invalid URL: ${location}`,
						),
					);
					return;
				}

				deactivate();
				response.destroy();

				fetchWithRedirects({
					url: nextUrl,
					dest,
					redirectsLeft: redirectsLeft - 1,
				})
					.then(resolve)
					.catch(reject);
			} else {
				response
					.pipe(fs.createWriteStream(dest))
					.on('finish', () => resolve())
					.on('error', reject);
			}
		});

		request = clientRequest;
		resetRequestTimeout();

		clientRequest.on('close', clearRequestTimeout);

		clientRequest.on('error', (err) => {
			if (!active) {
				return;
			}

			deactivate();
			reject(err);
		});
	});
};

export function fetch(url: string, dest: string) {
	return fetchWithRedirects({url, dest, redirectsLeft: MAX_REDIRECTS});
}

function untar(file: string, dest: string) {
	return tar.extract(
		{
			file,
			strip: 1,
			C: dest,
		},
		[],
	);
}

export const degit = async ({
	repoOrg,
	repoName,
	dest,
}: {
	repoOrg: string;
	repoName: string;
	dest: string;
}) => {
	const base = path.join(tmpdir(), '.degit');
	const dir = path.join(base, repoOrg, repoName);
	const file = `${dir}/HEAD.tar.gz`;
	const url = `https://github.com/${repoOrg}/${repoName}/archive/HEAD.tar.gz`;

	mkdirp(path.dirname(file));
	await fetch(url, file);

	mkdirp(dest);
	await untar(file, dest);
	fs.unlinkSync(file);
};
