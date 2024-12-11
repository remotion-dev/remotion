import {truthy} from '../truthy';
import {IoEventEmitter} from './event-emitter';
import {withResolvers} from './with-resolvers';

// Make sure to distinguish null and undefined here

export const makeProgressTracker = () => {
	const trackNumberProgresses: Record<number, number | null> = {};
	const eventEmitter = new IoEventEmitter();

	const calculateSmallestProgress = (initialTimestamp: number | null) => {
		const progressValues = Object.values(trackNumberProgresses).filter(truthy);
		if (progressValues.length === 0) {
			if (initialTimestamp === null) {
				throw new Error(
					'No progress values to calculate smallest progress from',
				);
			}

			return initialTimestamp - 1;
		}

		return Math.min(...progressValues);
	};

	return {
		registerTrack: (trackNumber: number) => {
			trackNumberProgresses[trackNumber] = null;
		},
		getSmallestProgress: calculateSmallestProgress,
		updateTrackProgress: (trackNumber: number, progress: number) => {
			if (trackNumberProgresses[trackNumber] === undefined) {
				throw new Error(
					`Tried to update progress for a track that was not registered: ${trackNumber}`,
				);
			}

			trackNumberProgresses[trackNumber] = progress;
			eventEmitter.dispatchEvent('progress', {
				smallestProgress: calculateSmallestProgress(null),
			});
		},
		waitForProgress: () => {
			const {promise, resolve} = withResolvers<void>();
			const on = () => {
				eventEmitter.removeEventListener('processed', on);
				resolve();
			};

			eventEmitter.addEventListener('processed', on);
			return promise;
		},
	};
};

export type ProgressTracker = ReturnType<typeof makeProgressTracker>;
