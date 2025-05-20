import {IoEventEmitter} from './event-emitter';

// Make sure to distinguish null and undefined here

export const makeProgressTracker = () => {
	const trackNumberProgresses: Record<number, number | null> = {};
	const eventEmitter = new IoEventEmitter();

	let startingTimestamp: number | null = null;

	const setPossibleLowestTimestamp = (timestamp: number) => {
		if (startingTimestamp === null) {
			startingTimestamp = timestamp;
		} else {
			startingTimestamp = Math.min(startingTimestamp, timestamp);
		}
	};

	const getSmallestProgress = () => {
		const progressValues = Object.values(trackNumberProgresses).map((p) => {
			if (p !== null) {
				return p;
			}

			// The starting timestamp might not be 0, it might be very huge
			// If no sample has arrived yet, we should assume the smallest value
			// we know as the progress
			if (startingTimestamp === null) {
				throw new Error(
					'No progress values to calculate smallest progress from',
				);
			}

			return startingTimestamp;
		});

		return Math.min(...progressValues);
	};

	return {
		registerTrack: (trackNumber: number) => {
			trackNumberProgresses[trackNumber] = null;
		},
		getSmallestProgress,
		updateTrackProgress: (trackNumber: number, progress: number) => {
			if (trackNumberProgresses[trackNumber] === undefined) {
				throw new Error(
					`Tried to update progress for a track that was not registered: ${trackNumber}`,
				);
			}

			trackNumberProgresses[trackNumber] = progress;
			eventEmitter.dispatchEvent('progress', {
				smallestProgress: getSmallestProgress(),
			});
		},
		setPossibleLowestTimestamp,
	};
};

export type ProgressTracker = ReturnType<typeof makeProgressTracker>;
