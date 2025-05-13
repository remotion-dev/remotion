export const storeActualTranscriptionSpeed = (speed: number) => {
	window.localStorage.setItem(
		'remotion-whisper-wasm-transcription-speed',
		speed.toString(),
	);
};

// conservative estimate that 30 seconds of audio takes 30 second to process
const DEFAULT_ASSUMED_SPEED = 1;
export const NEW_PROGRESS_EVENT_EVERY_N_SECONDS = 30;

export const getActualTranscriptionSpeedInMilliseconds = () => {
	const speed = window.localStorage.getItem(
		'remotion-whisper-wasm-transcription-speed',
	);
	if (!speed) {
		return DEFAULT_ASSUMED_SPEED * NEW_PROGRESS_EVENT_EVERY_N_SECONDS * 1000;
	}

	return parseFloat(speed);
};
