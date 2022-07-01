import {createWriteStream} from 'fs';
import {ensureOutputDirectory} from '../ensure-output-directory';
import {getSanitizedFilenameForAssetUrl} from './download-and-map-assets-to-file';
import {readFile} from './read-file';

export const downloadFile = ({
	onProgress,
	url,
	downloadDir,
}: {
	url: string;
	downloadDir: string;
	onProgress:
		| ((progress: {
				progress: number;
				downloaded: number;
				totalSize: number;
		  }) => void)
		| undefined;
}) => {
	return new Promise<{sizeInBytes: number; to: string}>((resolve, reject) => {
		readFile(url)
			.then((res) => {
				const contentDisposition = res.headers['content-disposition'] ?? null;
				const to = getSanitizedFilenameForAssetUrl({
					downloadDir,
					src: url,
					contentDisposition,
				});
				ensureOutputDirectory(to);

				const totalSize = Number(res.headers['content-length']);
				const writeStream = createWriteStream(to);

				// Listen to 'close' event instead of more
				// concise method to avoid this problem
				// https://github.com/remotion-dev/remotion/issues/384#issuecomment-844398183
				writeStream.on('close', () => resolve({sizeInBytes: totalSize, to}));
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
