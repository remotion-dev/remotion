import {createWriteStream} from 'fs';
import {ensureOutputDirectory} from '../ensure-output-directory';
import {readFile} from './read-file';

type Response = {sizeInBytes: number; to: string};

export const downloadFile = ({
	onProgress,
	url,
	to: toFn,
}: {
	url: string;
	to: (contentDisposition: string | null, contentType: string | null) => string;
	onProgress:
		| ((progress: {
				percent: number | null;
				downloaded: number;
				totalSize: number | null;
		  }) => void)
		| undefined;
}) => {
	return new Promise<Response>((resolve, reject) => {
		let rejected = false;
		let resolved = false;
		let timeout: NodeJS.Timeout | undefined;

		const resolveAndFlag = (val: Response) => {
			resolved = true;
			resolve(val);
			if (timeout) {
				clearTimeout(timeout);
			}
		};

		const rejectAndFlag = (err: Error) => {
			if (timeout) {
				clearTimeout(timeout);
			}

			reject(err);
			rejected = true;
		};

		const refreshTimeout = () => {
			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = setTimeout(() => {
				if (resolved) {
					return;
				}

				rejectAndFlag(
					new Error(
						`Tried to download file ${url}, but no progress was made for 20 seconds`
					)
				);
			}, 20000);
		};

		refreshTimeout();

		readFile(url)
			.then((res) => {
				const contentDisposition = res.headers['content-disposition'] ?? null;
				const contentType = res.headers['content-type'] ?? null;
				const to = toFn(contentDisposition, contentType);
				ensureOutputDirectory(to);

				const sizeHeader = res.headers['content-length'];

				const totalSize =
					typeof sizeHeader === 'undefined' ? null : Number(sizeHeader);
				const writeStream = createWriteStream(to);

				let downloaded = 0;
				// Listen to 'close' event instead of more
				// concise method to avoid this problem
				// https://github.com/remotion-dev/remotion/issues/384#issuecomment-844398183
				writeStream.on('close', () => {
					if (rejected) {
						return;
					}

					onProgress?.({
						downloaded,
						percent: 1,
						totalSize: downloaded,
					});
					refreshTimeout();
					return resolveAndFlag({sizeInBytes: downloaded, to});
				});
				writeStream.on('error', (err) => rejectAndFlag(err));
				res.on('error', (err) => rejectAndFlag(err));
				res.pipe(writeStream).on('error', (err) => rejectAndFlag(err));
				res.on('data', (d) => {
					downloaded += d.length;
					onProgress?.({
						downloaded,
						percent: totalSize === null ? null : downloaded / totalSize,
						totalSize,
					});
				});
				res.on('close', () => {
					if (totalSize !== null && downloaded !== totalSize) {
						rejectAndFlag(
							new Error(
								`Download finished with ${downloaded} bytes, but expected ${totalSize} bytes from 'Content-Length'.`
							)
						);
					}

					writeStream.close();
				});
			})
			.catch((err) => {
				rejectAndFlag(err);
			});
	});
};
