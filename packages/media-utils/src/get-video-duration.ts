export const getVideoDuration = (src: string) => {
	const video = document.createElement('video');
	video.src = src;
	return new Promise<number>((resolve, reject) => {
		const onError = (ev: ErrorEvent) => {
			reject(ev.error);
			cleanup();
		};
		const onLoadedMetadata = () => {
			resolve(video.duration);
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
