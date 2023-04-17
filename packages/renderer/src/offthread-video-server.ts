import type {RequestListener} from 'http';
import {URLSearchParams} from 'url';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {downloadAsset} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import {startCompositor} from './compositor/compositor';

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

	return {
		src,
		time: parseFloat(time),
	};
};

export const startOffthreadVideoServer = ({
	onDownload,
	onError,
	downloadMap,
}: {
	onDownload: RenderMediaOnDownload;
	onError: (err: Error) => void;
	downloadMap: DownloadMap;
}): {listener: RequestListener; close: () => Promise<void>} => {
	const compositor = startCompositor('StartLongRunningProcess', {});

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

			const {src, time} = extractUrlAndSourceFromUrl(req.url);
			res.setHeader('access-control-allow-origin', '*');
			res.setHeader('content-type', `image/bmp`);

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

			downloadAsset({src, onDownload, downloadMap})
				.then((to) => {
					return compositor.executeCommand('ExtractFrame', {
						input: to,
						time,
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
					onError(err);
					console.log('Error occurred', err);
				});
		},
	};
};
