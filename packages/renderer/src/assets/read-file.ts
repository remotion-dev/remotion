import https from 'https';
import http from 'node:http';
import {redirectStatusCodes} from '../redirect-status-codes';
import {truthy} from '../truthy';

const getClient = (url: string) => {
	if (url.startsWith('https://')) {
		return https.get;
	}

	if (url.startsWith('http://')) {
		return http.get;
	}

	throw new Error(
		`Can only download URLs starting with http:// or https://, got "${url}"`,
	);
};

const readFileWithoutRedirect = (
	url: string,
): Promise<http.IncomingMessage> => {
	return new Promise<http.IncomingMessage>((resolve, reject) => {
		const client = getClient(url);
		client(
			url,
			// Bun 1.1.16 does not support the `headers` option
			typeof Bun === 'undefined'
				? {
						headers: {
							'user-agent':
								'Mozilla/5.0 (@remotion/renderer - https://remotion.dev)',
						},
					}
				: {},
			(res) => {
				resolve(res);
			},
		).on('error', (err) => {
			return reject(err);
		});
	});
};

export const readFile = async (
	url: string,
	redirectsSoFar = 0,
): Promise<http.IncomingMessage> => {
	if (redirectsSoFar > 10) {
		throw new Error(`Too many redirects while downloading ${url}`);
	}

	const file = await readFileWithoutRedirect(url);
	if (redirectStatusCodes.includes(file.statusCode as number)) {
		if (!file.headers.location) {
			throw new Error(
				`Received a status code ${file.statusCode} but no "Location" header while calling ${file.headers.location}`,
			);
		}

		const {origin} = new URL(url);
		const redirectUrl = new URL(file.headers.location, origin).toString();

		return readFile(redirectUrl, redirectsSoFar + 1);
	}

	if ((file.statusCode as number) >= 400) {
		const body = await tryToObtainBody(file);

		throw new Error(
			[
				`Received a status code of ${file.statusCode} while downloading file ${url}.`,
				body ? `The response body was:` : null,
				body ? `---` : null,
				body ? body : null,
				body ? `---` : null,
			]
				.filter(truthy)
				.join('\n'),
		);
	}

	return file;
};

const tryToObtainBody = async (file: http.IncomingMessage) => {
	const success = new Promise<string>((resolve) => {
		let data = '';
		file.on('data', (chunk) => {
			data += chunk;
		});
		file.on('end', () => {
			resolve(data);
		});
		// OK even when getting an error, this is just a best effort
		file.on('error', () => resolve(data));
	});

	let timeout: Timer | null = null;

	const body = await Promise.race<string | null>([
		success,
		new Promise<null>((resolve) => {
			timeout = setTimeout(() => {
				resolve(null);
			}, 5000);
		}),
	]);

	if (timeout) {
		clearTimeout(timeout);
	}

	return body;
};
