import http, {RequestListener} from 'http';
import {FfmpegExecutable} from 'remotion';
import {URLSearchParams} from 'url';
import {waitForAssetToBeDownloaded} from './assets/download-and-map-assets-to-file';
import {extractFrameFromVideo} from './extract-frame-from-video';

type StartOffthreadVideoServerReturnType = {
	close: () => void;
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
	ffmpegExecutable: FfmpegExecutable
): Promise<StartOffthreadVideoServerReturnType> => {
	const requestListener: RequestListener = (req, res) => {
		res.setHeader('content-type', 'image/png');
		res.writeHead(200);
		if (!req.url) {
			throw new Error('Request came in without URL');
		}

		const {src, time} = extractUrlAndSourceFromUrl(req.url);
		waitForAssetToBeDownloaded(src)
			.then((res) => {
				return extractFrameFromVideo({
					time,
					src,
					ffmpegExecutable,
				});
			})
			.then((readable) => {
				if (!readable) {
					throw new Error('no readable from ffmpeg');
				}
				console.log('got readable');
				readable.pipe(res).on('close', () => {
					res.end();
				});
			})
			.catch((err) => {
				// TODO Return 500
				console.log('Error occurred', err);
			});
	};

	const server = http.createServer(requestListener);
	return new Promise<StartOffthreadVideoServerReturnType>((resolve) => {
		server.listen(9999, 'localhost', () => {
			resolve({
				close: () => server.close(),
			});
		});
	});
};
