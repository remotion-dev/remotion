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

type NodeRequestAndResponse = {
	request: http.ClientRequest;
	response: http.IncomingMessage;
};

const readFileWithoutRedirect = (
	url: string,
): Promise<NodeRequestAndResponse> => {
	return new Promise<NodeRequestAndResponse>((resolve, reject) => {
		const client = getClient(url);
		const req = client(
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
				resolve({request: req, response: res});
			},
		);

		req.on('error', (err) => {
			req.destroy();
			return reject(err);
		});
	});
};

export const readFile = async (
	url: string,
	redirectsSoFar = 0,
): Promise<NodeRequestAndResponse> => {
	if (redirectsSoFar > 10) {
		throw new Error(`Too many redirects while downloading ${url}`);
	}

	const {request, response} = await readFileWithoutRedirect(url);
	if (redirectStatusCodes.includes(response.statusCode as number)) {
		if (!response.headers.location) {
			throw new Error(
				`Received a status code ${response.statusCode} but no "Location" header while calling ${response.headers.location}`,
			);
		}

		const {origin} = new URL(url);
		const redirectUrl = new URL(response.headers.location, origin).toString();

		request.destroy();
		response.destroy();

		return readFile(redirectUrl, redirectsSoFar + 1);
	}

	if ((response.statusCode as number) >= 400) {
		const body = await tryToObtainBody(response);

		request.destroy();
		response.destroy();

		throw new Error(
			[
				`Received a status code of ${response.statusCode} while downloading file ${url}.`,
				body ? `The response body was:` : null,
				body ? `---` : null,
				body ? body : null,
				body ? `---` : null,
			]
				.filter(truthy)
				.join('\n'),
		);
	}

	return {request, response};
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
