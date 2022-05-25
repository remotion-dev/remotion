import http, {RequestListener} from 'http';
import {FfmpegExecutable} from 'remotion';
import {URLSearchParams} from 'url';
import {
	RenderMediaOnDownload,
	startDownloadForSrc,
	waitForAssetToBeDownloaded,
} from './assets/download-and-map-assets-to-file';
import {extractFrameFromVideo} from './extract-frame-from-video';

type StartOffthreadVideoServerReturnType = {
	close: () => void;
	port: number;
};

export const extractUrlAndSourceFromUrl = (url: string) => {
	const parsed = new URL(url, 'http://localhost:9999');
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

	return {src, time: parseFloat(time)};
};

export const startOffthreadVideoServer = (
	ffmpegExecutable: FfmpegExecutable,
	downloadDir: string,
	onDownload: RenderMediaOnDownload,
	onError: (err: Error) => void
): Promise<StartOffthreadVideoServerReturnType> => {
	const requestListener: RequestListener = (req, res) => {
		if (!req.url) {
			throw new Error('Request came in without URL');
		}
		if (!req.url.startsWith('/proxy')) {
			res.writeHead(404);
			res.end();
			return;
		}

		res.setHeader('content-type', 'image/jpg');

		const {src, time} = extractUrlAndSourceFromUrl(req.url);
		startDownloadForSrc({src, downloadDir, onDownload}).catch((err) => {
			onError(
				new Error(`Error while downloading asset: ${(err as Error).stack}`)
			);
		});
		waitForAssetToBeDownloaded(src)
			.then((res) => {
				return extractFrameFromVideo({
					time,
					src: res,
					ffmpegExecutable,
				});
			})
			.then((readable) => {
				if (!readable) {
					throw new Error('no readable from ffmpeg');
				}

				res.writeHead(200);
				readable.pipe(res).on('close', () => {
					res.end();
				});
			})
			.catch((err) => {
				res.writeHead(500);
				res.end();
				// TODO Return 500
				console.log('Error occurred', err);
			});
	};

	const port = 9999;
	const server = http.createServer(requestListener);
	return new Promise<StartOffthreadVideoServerReturnType>((resolve) => {
		server.listen(port, 'localhost', () => {
			resolve({
				close: () => server.close(),
				port,
			});
		});
	});
};
