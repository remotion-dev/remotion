import http from 'http';
import https from 'https';
import {createWriteStream} from 'fs';

const getHttpClient = (url: string) => {
	if (url.startsWith('http://')) {
		return http.get;
	}

	if (url.startsWith('https://')) {
		return https.get;
	}

	throw new Error(
		'URL must start with http:// or https:// for it to be downloaded. Passed: ' +
			url
	);
};

export const downloadFile = (url: string, to: string) => {
	return new Promise<void>((resolve, reject) => {
		const writeStream = createWriteStream(to);

		// Listen to 'close' event instead of more
		// concise method to avoid this problem
		// https://github.com/remotion-dev/remotion/issues/384#issuecomment-844398183
		writeStream.on('close', () => resolve());
		writeStream.on('error', (err) => reject(err));

		getHttpClient(url)(url, (res) => {
			res.pipe(writeStream).on('error', (err) => reject(err));
		}).on('error', (err) => {
			return reject(err);
		});
	});
};
