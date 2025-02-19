import type {RequestListener} from 'node:http';
import {URLSearchParams} from 'node:url';
import {downloadAsset} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Compositor} from './compositor/compositor';
import {startCompositor} from './compositor/compositor';
import type {LogLevel} from './log-level';
import {isEqualOrBelowLogLevel} from './log-level';
import {Log} from './logger';
import {validateOffthreadVideoCacheSizeInBytes} from './options/offthreadvideo-cache-size';

export const extractUrlAndSourceFromUrl = (url: string) => {
	const parsed = new URL(url, 'http://localhost');
	const query = parsed.search;
	if (!query.trim()) {
		throw new Error('Expected query from ' + url);
	}

	const params = new URLSearchParams(query);
	const src = params.get('src');

	if (!src) {
		throw new Error('Did not pass `src` parameter');
	}

	const time = params.get('time');

	if (!time) {
		throw new Error('Did not get `time` parameter');
	}

	const transparent = params.get('transparent');

	const toneMapped = params.get('toneMapped');

	if (!toneMapped) {
		throw new Error('Did not get `toneMapped` parameter');
	}

	return {
		src,
		time: parseFloat(time),
		transparent: transparent === 'true',
		toneMapped: toneMapped === 'true',
	};
};

const REQUEST_CLOSED_TOKEN = 'Request closed';

export const startOffthreadVideoServer = ({
	downloadMap,
	logLevel,
	indent,
	offthreadVideoCacheSizeInBytes,
	binariesDirectory,
	offthreadVideoThreads,
}: {
	downloadMap: DownloadMap;
	offthreadVideoCacheSizeInBytes: number | null;
	offthreadVideoThreads: number;
	logLevel: LogLevel;
	indent: boolean;
	binariesDirectory: string | null;
}): {
	listener: RequestListener;
	close: () => Promise<void>;
	compositor: Compositor;
} => {
	validateOffthreadVideoCacheSizeInBytes(offthreadVideoCacheSizeInBytes);
	const compositor = startCompositor({
		type: 'StartLongRunningProcess',
		payload: {
			concurrency: offthreadVideoThreads,
			maximum_frame_cache_size_in_bytes: offthreadVideoCacheSizeInBytes,
			verbose: isEqualOrBelowLogLevel(logLevel, 'verbose'),
		},
		logLevel,
		indent,
		binariesDirectory,
	});

	return {
		close: async () => {
			// Note: This is being used as a promise:
			//     .close().then()
			// but if finishCommands() fails, it acts like a sync function,
			// therefore we have to catch an error and put a promise rejection
			try {
				await compositor.finishCommands();
				return compositor.waitForDone();
			} catch (err) {
				return Promise.reject(err);
			}
		},
		listener: (req, response) => {
			if (!req.url) {
				throw new Error('Request came in without URL');
			}

			if (!req.url.startsWith('/proxy')) {
				response.writeHead(404);
				response.end();
				return;
			}

			const {src, time, transparent, toneMapped} = extractUrlAndSourceFromUrl(
				req.url,
			);
			response.setHeader('access-control-allow-origin', '*');

			// Prevent caching of the response and excessive disk writes
			// https://github.com/remotion-dev/remotion/issues/2760
			response.setHeader(
				'cache-control',
				'no-cache, no-store, must-revalidate',
			);

			// Handling this case on Lambda:
			// https://support.google.com/chrome/a/answer/7679408?hl=en
			// Chrome sends Private Network Access preflights for subresources
			if (req.method === 'OPTIONS') {
				response.statusCode = 200;
				if (req.headers['access-control-request-private-network']) {
					response.setHeader('Access-Control-Allow-Private-Network', 'true');
				}

				response.end();
				return;
			}

			let closed = false;

			req.on('close', () => {
				closed = true;
			});

			let extractStart = Date.now();
			downloadAsset({
				src,
				downloadMap,
				indent,
				logLevel,
				binariesDirectory,
				cancelSignalForAudioAnalysis: undefined,
				shouldAnalyzeAudioImmediately: true,
			})
				.then((to) => {
					return new Promise<Uint8Array>((resolve, reject) => {
						if (closed) {
							reject(Error(REQUEST_CLOSED_TOKEN));
							return;
						}

						extractStart = Date.now();
						compositor
							.executeCommand('ExtractFrame', {
								src: to,
								original_src: src,
								time,
								transparent,
								tone_mapped: toneMapped,
							})
							.then(resolve)
							.catch(reject);
					});
				})
				.then((readable) => {
					return new Promise<void>((resolve, reject) => {
						if (closed) {
							reject(Error(REQUEST_CLOSED_TOKEN));
							return;
						}

						if (!readable) {
							reject(new Error('no readable from compositor'));
							return;
						}

						const extractEnd = Date.now();
						const timeToExtract = extractEnd - extractStart;

						if (timeToExtract > 1000) {
							Log.verbose(
								{indent, logLevel},
								`Took ${timeToExtract}ms to extract frame from ${src} at ${time}`,
							);
						}

						const firstByte = readable.at(0);
						const secondByte = readable.at(1);
						const thirdByte = readable.at(2);
						const isPng =
							firstByte === 0x89 && secondByte === 0x50 && thirdByte === 0x4e;
						const isBmp = firstByte === 0x42 && secondByte === 0x4d;
						if (isPng) {
							response.setHeader('content-type', `image/png`);
							response.setHeader('content-length', readable.byteLength);
						} else if (isBmp) {
							response.setHeader('content-type', `image/bmp`);
							response.setHeader('content-length', readable.byteLength);
						} else {
							reject(
								new Error(
									`Unknown file type: ${firstByte} ${secondByte} ${thirdByte}`,
								),
							);
							return;
						}

						response.writeHead(200);
						response.write(readable, (err) => {
							response.end();
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						});
					});
				})
				.catch((err) => {
					Log.error(
						{indent, logLevel},
						'Could not extract frame from compositor',
						err,
					);
					if (!response.headersSent) {
						response.writeHead(500);
						response.write(JSON.stringify({error: err.stack}));
					}

					response.end();
				});
		},
		compositor,
	};
};

type DownloadEventPayload = {
	src: string;
};

type ProgressEventPayload = {
	percent: number | null;
	downloaded: number;
	totalSize: number | null;
	src: string;
};

type EventMap = {
	progress: ProgressEventPayload;
	download: DownloadEventPayload;
};

export type EventTypes = keyof EventMap;

export type CallbackListener<T extends EventTypes> = (data: {
	detail: EventMap[T];
}) => void;

type Listeners = {
	[EventType in EventTypes]: CallbackListener<EventType>[];
};

export class OffthreadVideoServerEmitter {
	listeners: Listeners = {
		progress: [],
		download: [],
	};

	addEventListener<Q extends EventTypes>(
		name: Q,
		callback: CallbackListener<Q>,
	) {
		(this.listeners[name] as CallbackListener<Q>[]).push(callback);

		return () => {
			this.removeEventListener(name, callback);
		};
	}

	removeEventListener<Q extends EventTypes>(
		name: Q,
		callback: CallbackListener<Q>,
	) {
		this.listeners[name] = this.listeners[name].filter(
			(l) => l !== callback,
		) as Listeners[Q];
	}

	private dispatchEvent<T extends EventTypes>(
		dispatchName: T,
		context: EventMap[T],
	) {
		(this.listeners[dispatchName] as CallbackListener<T>[]).forEach(
			(callback) => {
				callback({detail: context});
			},
		);
	}

	dispatchDownloadProgress(
		src: string,
		percent: number | null,
		downloaded: number,
		totalSize: number | null,
	) {
		this.dispatchEvent('progress', {
			downloaded,
			percent,
			totalSize,
			src,
		});
	}

	dispatchDownload(src: string) {
		this.dispatchEvent('download', {
			src,
		});
	}
}
