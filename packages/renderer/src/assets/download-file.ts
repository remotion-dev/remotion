import https from 'https';
import {createWriteStream} from 'fs';

export const downloadFile = (url: string, to: string) => {
	return new Promise<void>((resolve, reject) => {
		const writeStream = createWriteStream(to);

		// Listen to 'close' event instead of more
		// concise method to avoid this problem
		// https://github.com/remotion-dev/remotion/issues/384#issuecomment-844398183
		writeStream.on('close', () => resolve());
		writeStream.on('error', (err) => reject(err));

		https
			.get(url, (res) => {
				res.pipe(writeStream).on('error', (err) => reject(err));
			})
			.on('error', (err) => {
				return reject(err);
			});
	});
};
