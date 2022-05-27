import {createWriteStream} from 'fs';
import {readFile} from './read-file';

export const downloadFile = (
	url: string,
	to: string,
	onProgress:
		| ((progress: {
				progress: number;
				downloaded: number;
				totalSize: number;
		  }) => void)
		| undefined
) => {
	return new Promise<{sizeInBytes: number}>((resolve, reject) => {
		readFile(url)
			.then((res) => {
				const totalSize = Number(res.headers['content-length']);
				const writeStream = createWriteStream(to);

				// Listen to 'close' event instead of more
				// concise method to avoid this problem
				// https://github.com/remotion-dev/remotion/issues/384#issuecomment-844398183
				writeStream.on('close', () => resolve({sizeInBytes: totalSize}));
				writeStream.on('error', (err) => reject(err));
				let downloaded = 0;
				res.pipe(writeStream).on('error', (err) => reject(err));
				res.on('data', (d) => {
					downloaded += d.length;
					onProgress?.({
						downloaded,
						progress: downloaded / totalSize,
						totalSize,
					});
				});
			})
			.catch((err) => {
				reject(err);
			});
	});
};
