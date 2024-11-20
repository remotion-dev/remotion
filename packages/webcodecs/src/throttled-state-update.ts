import type {
	ConvertMediaOnProgress,
	ConvertMediaProgress,
} from './convert-media';

export type ConvertMediaProgressFn = (
	state: (prevState: ConvertMediaProgress) => ConvertMediaProgress,
) => void;

type ReturnType = {
	get: () => ConvertMediaProgress;
	update: ConvertMediaProgressFn | null;
	stop: () => void;
};

export const throttledStateUpdate = ({
	updateFn,
	everyMilliseconds,
	signal,
}: {
	updateFn: ConvertMediaOnProgress | null;
	everyMilliseconds: number;
	signal: AbortSignal;
}): ReturnType => {
	let currentState: ConvertMediaProgress = {
		decodedAudioFrames: 0,
		decodedVideoFrames: 0,
		encodedVideoFrames: 0,
		encodedAudioFrames: 0,
		bytesWritten: 0,
		millisecondsWritten: 0,
		expectedOutputDurationInMs: null,
		overallProgress: 0,
	};
	if (!updateFn) {
		return {
			get: () => currentState,
			update: null,
			stop: () => {},
		};
	}

	const interval = setInterval(() => {
		updateFn(currentState);
	}, everyMilliseconds);

	const onAbort = () => {
		clearInterval(interval);
	};

	signal.addEventListener('abort', onAbort, {once: true});

	return {
		get: () => currentState,
		update: (fn: (prevState: ConvertMediaProgress) => ConvertMediaProgress) => {
			currentState = fn(currentState);
		},
		stop: () => {
			clearInterval(interval);
			signal.removeEventListener('abort', onAbort);
		},
	};
};
