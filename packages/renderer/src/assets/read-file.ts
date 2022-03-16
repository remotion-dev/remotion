import http from 'http';
import https from 'https';

const getClient = (url: string) => {
	if (url.startsWith('https://')) {
		return https.get;
	}

	if (url.startsWith('http://')) {
		return http.get;
	}

	throw new Error('Can only download URLs starting with http:// or https://');
};

export const readFile = (url: string): Promise<http.IncomingMessage> => {
	return new Promise<http.IncomingMessage>((resolve, reject) => {
		getClient(url)(url, (res) => {
			resolve(res);
		}).on('error', (err) => {
			return reject(err);
		});
	});
};
