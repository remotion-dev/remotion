import {isRemoteAsset} from './is-remote-asset';
import {VideoMetadata} from './types';

const cache: {[key: string]: VideoMetadata} = {};

export const getVideoMetadata = async (src: string): Promise<VideoMetadata> => {
	if (cache[src]) {
		return cache[src];
	}

	const video = document.createElement('video');
	video.src = src;
	return new Promise<VideoMetadata>((resolve, reject) => {
		const onError = (ev: ErrorEvent) => {
			reject(ev.error);
			cleanup();
		};

		const onLoadedMetadata = () => {
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
		};

		video.addEventListener('loadedmetadata', onLoadedMetadata, {once: true});
		video.addEventListener('error', onError, {once: true});
	});
};
