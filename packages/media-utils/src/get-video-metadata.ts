import {isRemoteAsset} from './is-remote-asset';
import {pLimit} from './p-limit';
import type {VideoMetadata} from './types';

const cache: {[key: string]: VideoMetadata} = {};

const limit = pLimit(3);

const fn = (src: string): Promise<VideoMetadata> => {
	if (cache[src]) {
		return Promise.resolve(cache[src]);
	}

	if (typeof document === 'undefined') {
		throw new Error('getVideoMetadata() is only available in the browser.');
	}

	const video = document.createElement('video');
	video.src = src;
	return new Promise<VideoMetadata>((resolve, reject) => {
		const onError = () => {
			reject(video.error);
			cleanup();
		};

		const onLoadedMetadata = () => {
			const pixels = video.videoHeight * video.videoWidth;

			if (pixels === 0) {
				reject(new Error('Unable to determine video metadata'));
				return;
			}

			const metadata: VideoMetadata = {
				durationInSeconds: video.duration,
				width: video.videoWidth,
				height: video.videoHeight,
				aspectRatio: video.videoWidth / video.videoHeight,
				isRemote: isRemoteAsset(src),
			};
			resolve(metadata);
			cache[src] = metadata;

			cleanup();
		};

		const cleanup = () => {
			video.removeEventListener('loadedmetadata', onLoadedMetadata);
			video.removeEventListener('error', onError);
			video.remove();
		};

		video.addEventListener('loadedmetadata', onLoadedMetadata, {once: true});
		video.addEventListener('error', onError, {once: true});
	});
};

export const getVideoMetadata = (src: string) => {
	return limit(fn, src);
};
