import {isRemoteAsset} from './is-remote-asset';
import {VideoData} from './types';

export const getVideoMetadata = async (src: string): Promise<VideoData> => {
	const video = document.createElement('video');
	video.src = src;
	return new Promise<VideoData>((resolve, reject) => {
		const onError = (ev: ErrorEvent) => {
			reject(ev.error);
			cleanup();
		};
		const onLoadedMetadata = () => {
			resolve({
				durationInSeconds: video.duration,
				width: video.videoWidth,
				height: video.videoHeight,
				aspectRatio: video.videoWidth / video.videoHeight,
				isRemote: isRemoteAsset(src),
			});
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
