/* eslint-disable no-console */
import type fs from 'fs';
export type OnProgress = (downloadedBytes: number, totalBytes: number) => void;

const closeStream = async (fileStream: fs.WriteStream) => {
	if (fileStream.closed) {
		return;
	}

	await new Promise<void>((resolve) => {
		fileStream.once('close', () => resolve());
		fileStream.destroy();
	});
};

export const downloadFile = async ({
	fileStream,
	url,
	printOutput,
	onProgress,
	signal,
}: {
	fileStream: fs.WriteStream;
	url: string;
	printOutput: boolean;
	onProgress: OnProgress | undefined;
	signal: AbortSignal | null;
}) => {
	try {
		const {body, headers} = await fetch(url, {
			signal,
		});
		const contentLength = headers.get('content-length');

		if (body === null) {
			throw new Error('Failed to download whisper model');
		}

		if (contentLength === null) {
			throw new Error('Content-Length header not found');
		}

		let downloaded = 0;
		let lastPrinted = 0;

		const totalFileSize = parseInt(contentLength, 10);

		if (!Number.isFinite(totalFileSize)) {
			throw new Error(`Invalid Content-Length header "${contentLength}"`);
		}

		const reader = body.getReader();
		// eslint-disable-next-line no-async-promise-executor
		await new Promise<void>(async (resolve, reject) => {
			try {
				while (true) {
					const {done, value} = await reader.read();

					if (done) {
						break;
					}

					if (!value) {
						continue;
					}

					downloaded += value.length;

					if (
						printOutput &&
						(downloaded - lastPrinted > 1024 * 1024 * 10 ||
							downloaded === totalFileSize)
					) {
						console.log(
							`Downloaded ${downloaded} of ${contentLength} bytes (${(
								(downloaded / Number(contentLength)) *
								100
							).toFixed(2)}%)`,
						);
						lastPrinted = downloaded;
					}

					await new Promise<void>((resolveWrite, rejectWrite) => {
						fileStream.write(value, (error) => {
							if (error) {
								rejectWrite(error);
								return;
							}

							resolveWrite();
						});
					});

					onProgress?.(downloaded, totalFileSize);
				}

				if (downloaded !== totalFileSize) {
					reject(
						new Error(
							`Download ended after ${downloaded} of ${totalFileSize} bytes. The connection closed before the file was complete.`,
						),
					);
					return;
				}

				fileStream.end();
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	} catch (e) {
		// Release the file handle before the caller removes the partial file.
		await closeStream(fileStream);
		throw e;
	}
};
