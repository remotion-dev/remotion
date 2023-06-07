import type {RequestListener} from 'node:http';
import {URLSearchParams} from 'node:url';
import {downloadAsset} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Compositor} from './compositor/compositor';
import {
	getIdealMaximumFrameCacheItems,
	startCompositor,
} from './compositor/compositor';

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

	return {
		src,
		time: parseFloat(time),
		transparent: transparent === 'true',
	};
};

export const startOffthreadVideoServer = ({
	downloadMap,
	concurrency,
	verbose,
	indent,
}: {
	downloadMap: DownloadMap;
	concurrency: number;
	verbose: boolean;
	indent: boolean;
}): {
	listener: RequestListener;
	close: () => Promise<void>;
	compositor: Compositor;
	events: OffthreadVideoServerEmitter;
} => {
	const events = new OffthreadVideoServerEmitter();
	const compositor = startCompositor(
		'StartLongRunningProcess',
		{
			concurrency,
			maximum_frame_cache_items: getIdealMaximumFrameCacheItems(),
			verbose,
		},
		indent
	);

	return {
		close: () => {
			compositor.finishCommands();
			return compositor.waitForDone();
		},
		listener: (req, res) => {
			if (!req.url) {
				throw new Error('Request came in without URL');
			}

			if (!req.url.startsWith('/proxy')) {
				res.writeHead(404);
				res.end();
				return;
			}

			const {src, time, transparent} = extractUrlAndSourceFromUrl(req.url);
			res.setHeader('access-control-allow-origin', '*');
			if (transparent) {
				res.setHeader('content-type', `image/png`);
			} else {
				res.setHeader('content-type', `image/bmp`);
			}

			// Handling this case on Lambda:
			// https://support.google.com/chrome/a/answer/7679408?hl=en
			// Chrome sends Private Network Access preflights for subresources
			if (req.method === 'OPTIONS') {
				res.statusCode = 200;
				if (req.headers['access-control-request-private-network']) {
					res.setHeader('Access-Control-Allow-Private-Network', 'true');
				}

				res.end();
				return;
			}

			downloadAsset({src, emitter: events, downloadMap})
				.then((to) => {
					return compositor.executeCommand('ExtractFrame', {
						input: to,
						time,
						transparent,
					});
				})
				.then((readable) => {
					if (!readable) {
						throw new Error('no readable from ffmpeg');
					}

					res.writeHead(200);
					res.write(readable);
					res.end();
				})
				.catch((err) => {
					res.writeHead(500);
					res.end();
					events.dispatchError(err);
					console.log('Error occurred', err);
				});
		},
		compositor,
		events,
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

type ErrorEventPayload = {
	error: Error;
};

type EventMap = {
	progress: ProgressEventPayload;
	error: ErrorEventPayload;
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
		error: [],
		progress: [],
		download: [],
	};

	addEventListener<Q extends EventTypes>(
		name: Q,
		callback: CallbackListener<Q>
	) {
		(this.listeners[name] as CallbackListener<Q>[]).push(callback);

		return () => {
			this.removeEventListener(name, callback);
		};
	}

	removeEventListener<Q extends EventTypes>(
		name: Q,
		callback: CallbackListener<Q>
	) {
		this.listeners[name] = this.listeners[name].filter(
			(l) => l !== callback
		) as Listeners[Q];
	}

	private dispatchEvent<T extends EventTypes>(
		dispatchName: T,
		context: EventMap[T]
	) {
		(this.listeners[dispatchName] as CallbackListener<T>[]).forEach(
			(callback) => {
				callback({detail: context});
			}
		);
	}

	dispatchError(error: Error) {
		this.dispatchEvent('error', {
			error,
		});
	}

	dispatchDownloadProgress(
		src: string,
		percent: number | null,
		downloaded: number,
		totalSize: number | null
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
