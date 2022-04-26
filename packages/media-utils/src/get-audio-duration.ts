/**
 * Get the audio file passed in parameter duration in seconds
 * @async
 * @param src path to the audio file
 * @return {number} duration of the audio file in seconds
 */
export const getAudioDurationInSeconds = (src: string): Promise<number> => {
	const audio = document.createElement('audio');
	audio.src = src;
	return new Promise<number>((resolve, reject) => {
		const onError = () => {
			reject(audio.error);
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
