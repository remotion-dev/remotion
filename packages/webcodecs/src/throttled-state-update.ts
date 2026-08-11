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
	stopAndGetLastProgress: () => void;
};

export const throttledStateUpdate = ({
	updateFn,
	everyMilliseconds,
	signal,
}: {
	updateFn: ConvertMediaOnProgress | null;
	everyMilliseconds: number;
	signal: AbortSignal | null;
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
			stopAndGetLastProgress: () => {},
		};
	}

	let lastUpdated: ConvertMediaProgress | null = null;

	const callUpdateIfChanged = () => {
		if (currentState === lastUpdated) {
			return;
		}

		updateFn(currentState);
		lastUpdated = currentState;
	};

	const interval = setInterval(() => {
		callUpdateIfChanged();
	}, everyMilliseconds);

	const onAbort = () => {
		clearInterval(interval);
	};

	signal?.addEventListener('abort', onAbort, {once: true});

	return {
		get: () => currentState,
		update: (fn: (prevState: ConvertMediaProgress) => ConvertMediaProgress) => {
			currentState = fn(currentState);
		},
		stopAndGetLastProgress: () => {
			clearInterval(interval);
			signal?.removeEventListener('abort', onAbort);
			return currentState;
		},
	};
};
