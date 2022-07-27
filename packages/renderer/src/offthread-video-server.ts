import type {RequestListener} from 'http';
import type {DownloadMap, OffthreadVideoImageFormat} from 'remotion';
import {Internals} from 'remotion';
import {URLSearchParams} from 'url';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {downloadAsset} from './assets/download-and-map-assets-to-file';
import {extractFrameFromVideo} from './extract-frame-from-video';
import type {FfmpegExecutable} from './ffmpeg-executable';

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

	const imageFormat = params.get('imageFormat');

	if (!imageFormat) {
		throw new TypeError('Did not get `imageFormat` parameter');
	}

	Internals.validateOffthreadVideoImageFormat(imageFormat);

	return {
		src,
		time: parseFloat(time),
		imageFormat: imageFormat as OffthreadVideoImageFormat,
	};
};

export const startOffthreadVideoServer = ({
	ffmpegExecutable,
	ffprobeExecutable,
	downloadDir,
	onDownload,
	onError,
	downloadMap,
}: {
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
	downloadDir: string;
	onDownload: RenderMediaOnDownload;
	onError: (err: Error) => void;
	downloadMap: DownloadMap;
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

		const {src, time, imageFormat} = extractUrlAndSourceFromUrl(req.url);
		res.setHeader('access-control-allow-origin', '*');
		res.setHeader(
			'content-type',
			`image/${imageFormat === 'jpeg' ? 'jpg' : 'png'}`
		);

		Promise.race<string>([
			downloadAsset({src, downloadDir, onDownload, downloadMap}),
			new Promise((_, rej) => {
				setTimeout(() => rej(new Error(String('TIMEOUT FOR ' + src))), 15000);
			}),
		])
			.then((to) => {
				const random = Math.random();
				console.time(src + random);
				return Promise.race([
					extractFrameFromVideo({
						time,
						src: to,
						ffmpegExecutable,
						ffprobeExecutable,
						imageFormat,
					}),
					new Promise((_, rej) => {
						setTimeout(
							() => rej(new Error(String('EXTRACTION TIMEDOUT FOR ' + src))),
							15000
						);
					}),
				]).then((a) => {
					console.timeEnd(src + random);
					return a;
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
	};
};
