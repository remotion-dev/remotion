/* eslint-disable @typescript-eslint/no-use-before-define */
import {isRemoteAsset} from './is-remote-asset';
import {onMediaError} from './media-tag-error-handling';
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
			onMediaError({
				error: video.error!,
				src,
				cleanup,
				reject,
				api: 'getVideoMetadata()',
			});
		};

		const onLoadedMetadata = () => {
			const pixels = video.videoHeight * video.videoWidth;

			if (pixels === 0) {
				reject(new Error(`Unable to determine video metadata for ${src}`));
				return;
			}

			if (!Number.isFinite(video.duration)) {
				reject(
					new Error(
						`Unable to determine video duration for ${src} - got Infinity. Re-encoding this video may fix this issue.`,
					),
				);
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

/**
 * @description Takes a src to a video, loads it and returns metadata for the specified source.
 * @see [Documentation](https://remotion.dev/docs/get-video-metadata)
 * @deprecated Use `parseMedia()` instead: https://www.remotion.dev/docs/miscellaneous/parse-media-vs-get-video-metadata
 */
export const getVideoMetadata = (src: string) => {
	return limit(fn, src);
};
