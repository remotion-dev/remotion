import {createWriteStream} from 'node:fs';
import {ensureOutputDirectory} from '../ensure-output-directory';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';
import {readFile} from './read-file';

type Response = {sizeInBytes: number; to: string};

type Options = {
	url: string;
	to: (contentDisposition: string | null, contentType: string | null) => string;
	onProgress:
		| ((progress: {
				percent: number | null;
				downloaded: number;
				totalSize: number | null;
		  }) => void)
		| undefined;
	logLevel: LogLevel;
	indent: boolean;
	abortSignal: AbortSignal;
};

const CANCELLED_ERROR = 'cancelled';

const incorrectContentLengthToken = 'Download finished with';

const downloadFileWithoutRetries = ({
	onProgress,
	url,
	to: toFn,
	abortSignal,
}: Options) => {
	return new Promise<Response>((resolve, reject) => {
		let rejected = false;
		let resolved = false;
		let timeout: Timer | undefined;

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
						`Tried to download file ${url}, but the server sent no data for 20 seconds`,
					),
				);
			}, 20000);
		};

		refreshTimeout();

		let finishEventSent = false;

		let closeConnection = () => undefined;

		const onAbort = () => {
			rejectAndFlag(new Error(CANCELLED_ERROR));
			closeConnection();
		};

		abortSignal.addEventListener('abort', () => {
			onAbort();
		});

		readFile(url)
			.then(({response, request}) => {
				closeConnection = () => {
					request.destroy();
					response.destroy();
				};

				if (abortSignal.aborted) {
					onAbort();
					return;
				}

				const contentDisposition =
					response.headers['content-disposition'] ?? null;
				const contentType = response.headers['content-type'] ?? null;
				const to = toFn(contentDisposition, contentType);
				ensureOutputDirectory(to);

				const sizeHeader = response.headers['content-length'];

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

					if (!finishEventSent) {
						onProgress?.({
							downloaded,
							percent: 1,
							totalSize: downloaded,
						});
					}

					refreshTimeout();
					return resolveAndFlag({sizeInBytes: downloaded, to});
				});
				writeStream.on('error', (err) => rejectAndFlag(err));
				response.on('error', (err) => {
					closeConnection();
					rejectAndFlag(err);
				});
				response.pipe(writeStream).on('error', (err) => rejectAndFlag(err));
				response.on('data', (d) => {
					refreshTimeout();
					downloaded += d.length;
					refreshTimeout();
					const percent = totalSize === null ? null : downloaded / totalSize;
					onProgress?.({
						downloaded,
						percent,
						totalSize,
					});
					if (percent === 1) {
						finishEventSent = true;
					}
				});
				response.on('close', () => {
					if (totalSize !== null && downloaded !== totalSize) {
						rejectAndFlag(
							new Error(
								`${incorrectContentLengthToken} ${downloaded} bytes, but expected ${totalSize} bytes from 'Content-Length'.`,
							),
						);
					}

					writeStream.close();
					closeConnection();
				});
			})
			.catch((err) => {
				rejectAndFlag(err);
			})
			.finally(() => {
				abortSignal.removeEventListener('abort', onAbort);
			});
	});
};

export const downloadFile = async (
	options: Options,
	retries = 2,
	attempt = 1,
): Promise<Response> => {
	try {
		const res = await downloadFileWithoutRetries(options);
		return res;
	} catch (err) {
		const {message} = err as Error;
		if (message === CANCELLED_ERROR) {
			throw err;
		}

		if (
			message === 'aborted' ||
			message.includes('ECONNRESET') ||
			message.includes(incorrectContentLengthToken) ||
			// Try again if hitting internal errors
			message.includes('503') ||
			message.includes('502') ||
			message.includes('504') ||
			message.includes('500')
		) {
			if (retries === 0) {
				throw err;
			}

			Log.warn(
				{indent: options.indent, logLevel: options.logLevel},
				`Downloading ${options.url} failed (will retry): ${message}`,
			);
			const backoffInSeconds = (attempt + 1) ** 2;
			await new Promise<void>((resolve) => {
				setTimeout(() => resolve(), backoffInSeconds * 1000);
			});

			return downloadFile(options, retries - 1, attempt + 1);
		}

		throw err;
	}
};
