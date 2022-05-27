import {RequestListener} from 'http';
import {FfmpegExecutable} from 'remotion';
import {URLSearchParams} from 'url';
import {
	RenderMediaOnDownload,
	startDownloadForSrc,
	waitForAssetToBeDownloaded,
} from './assets/download-and-map-assets-to-file';
import {extractFrameFromVideo} from './extract-frame-from-video';

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

	return {src, time: parseFloat(time)};
};

export const startOffthreadVideoServer = ({
	ffmpegExecutable,
	downloadDir,
	onDownload,
	onError,
}: {
	ffmpegExecutable: FfmpegExecutable;
	downloadDir: string;
	onDownload: RenderMediaOnDownload;
	onError: (err: Error) => void;
}): RequestListener => {
	return (req, res) => {
		if (!req.url) {
			throw new Error('Request came in without URL');
		}

		if (!req.url.startsWith('/proxy')) {
			res.writeHead(404);
			res.end();
			return;
		}

		res.setHeader('access-control-allow-origin', '*');
		res.setHeader('content-type', 'image/jpg');

		const {src, time} = extractUrlAndSourceFromUrl(req.url);
		startDownloadForSrc({src, downloadDir, onDownload}).catch((err) => {
			onError(
				new Error(`Error while downloading asset: ${(err as Error).stack}`)
			);
		});
		waitForAssetToBeDownloaded(src)
			.then((newSrc) => {
				return extractFrameFromVideo({
					time,
					src: newSrc,
					ffmpegExecutable,
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
				console.log('Error occurred', err);
			});
	};
};
