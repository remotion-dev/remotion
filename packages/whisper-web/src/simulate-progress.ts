import {
	getActualTranscriptionSpeedInMilliseconds,
	NEW_PROGRESS_EVENT_EVERY_N_SECONDS,
	storeActualTranscriptionSpeed,
} from './transcription-speed';

export const simulateProgress = ({
	audioDurationInSeconds,
	onProgress,
}: {
	audioDurationInSeconds: number;
	onProgress: (num: number) => void;
}) => {
	let progress = 0;

	const progressSteps =
		audioDurationInSeconds / NEW_PROGRESS_EVENT_EVERY_N_SECONDS;

	let progressStepsReceived = 0;
	let timer: NodeJS.Timer | null = null;
	let lastTimerStart: number | null = null;

	const start = () => {
		const speed = getActualTranscriptionSpeedInMilliseconds();

		let iterations = 0;
		lastTimerStart = Date.now();

		timer = setInterval(() => {
			progress += 1 / NEW_PROGRESS_EVENT_EVERY_N_SECONDS / (progressSteps + 1);
			progress = Math.min(progress, 0.99);
			onProgress(progress);
			iterations += 1;
			if (iterations > NEW_PROGRESS_EVENT_EVERY_N_SECONDS - 1 && timer) {
				clearInterval(timer);
				timer = null;
			}
		}, speed / NEW_PROGRESS_EVENT_EVERY_N_SECONDS);
	};

	return {
		start,
		progressStepReceived: () => {
			progressStepsReceived += 1;
			progress = progressStepsReceived / progressSteps;
			if (timer) {
				clearInterval(timer);
				timer = null;
			}

			if (lastTimerStart) {
				const timeToProcessChunk = Date.now() - (lastTimerStart ?? Date.now());
				storeActualTranscriptionSpeed(timeToProcessChunk);
			}

			start();
		},
		onDone: () => {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}

			progress = 1;
			onProgress(1);
		},
		abort: () => {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		},
	};
};
