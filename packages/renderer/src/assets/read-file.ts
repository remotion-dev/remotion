import https from 'https';
import http from 'node:http';
import {redirectStatusCodes} from '../redirect-status-codes';

const getClient = (url: string) => {
	if (url.startsWith('https://')) {
		return https.get;
	}

	if (url.startsWith('http://')) {
		return http.get;
	}

	throw new Error(
		`Can only download URLs starting with http:// or https://, got "${url}"`
	);
};

const readFileWithoutRedirect = (
	url: string
): Promise<http.IncomingMessage> => {
	return new Promise<http.IncomingMessage>((resolve, reject) => {
		getClient(url)(url, (res) => {
			resolve(res);
		}).on('error', (err) => {
			return reject(err);
		});
	});
};

export const readFile = async (
	url: string,
	redirectsSoFar = 0
): Promise<http.IncomingMessage> => {
	if (redirectsSoFar > 10) {
		throw new Error(`Too many redirects while downloading ${url}`);
	}

	const file = await readFileWithoutRedirect(url);
	if (redirectStatusCodes.includes(file.statusCode as number)) {
		if (!file.headers.location) {
			throw new Error(
				`Received a status code ${file.statusCode} but no "Location" header while calling ${file.headers.location}`
			);
		}

		return readFile(file.headers.location, redirectsSoFar + 1);
	}

	if ((file.statusCode as number) >= 400) {
		throw new Error(
			`Received a status code of ${file.statusCode} while downloading file ${url}`
		);
	}

	return file;
};
