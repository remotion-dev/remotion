import {IoEventEmitter} from './event-emitter';
import {withResolvers} from './with-resolvers';

export const makeProgressTracker = () => {
	const trackNumberProgresses: Record<number, number> = {};
	const eventEmitter = new IoEventEmitter();

	const calculateSmallestProgress = () => {
		const progressValues = Object.values(trackNumberProgresses);
		if (progressValues.length === 0) {
			return 0;
		}

		return Math.min(...progressValues);
	};

	return {
		registerTrack: (trackNumber: number) => {
			trackNumberProgresses[trackNumber] = 0;
		},
		getSmallestProgress: () => {
			return calculateSmallestProgress();
		},
		updateTrackProgress: (trackNumber: number, progress: number) => {
			if (trackNumberProgresses[trackNumber] === undefined) {
				throw new Error(
					`Tried to update progress for a track that was not registered: ${trackNumber}`,
				);
			}

			trackNumberProgresses[trackNumber] = progress;
			eventEmitter.dispatchEvent('progress', {
				smallestProgress: calculateSmallestProgress(),
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
