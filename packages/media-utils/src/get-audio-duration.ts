export const getAudioDuration = (src: string): Promise<number> => {
	const audio = document.createElement('audio');
	audio.src = src;
	return new Promise<number>((resolve, reject) => {
		const onError = (ev: ErrorEvent) => {
			reject(ev.error);
			cleanup();
		};

		const onLoadedMetadata = () => {
			resolve(audio.duration);
			cleanup();
		};

		const cleanup = () => {
			audio.removeEventListener('loadedmetadata', onLoadedMetadata);
			audio.removeEventListener('error', onError);
		};

		audio.addEventListener('loadedmetadata', onLoadedMetadata, {once: true});
		audio.addEventListener('error', onError, {once: true});
	});
};
