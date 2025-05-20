import {makeTimeoutPromise} from '../io-manager/make-timeout-promise';
import type {WebCodecsController} from '../webcodecs-controller';
import {IoEventEmitter} from './event-emitter';
import {withResolvers} from './with-resolvers';

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

	const getStartingTimestamp = () => {
		if (startingTimestamp === null) {
			throw new Error('No starting timestamp');
		}

		return startingTimestamp;
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

	const waitForProgress = () => {
		const {promise, resolve} = withResolvers<void>();
		const on = () => {
			eventEmitter.removeEventListener('progress', on);
			resolve();
		};

		eventEmitter.addEventListener('progress', on);
		return promise;
	};

	const waitForMinimumProgress = async ({
		minimumProgress,
		controller,
	}: {
		minimumProgress: number;
		controller: WebCodecsController;
	}) => {
		await controller._internals._mediaParserController._internals.checkForAbortAndPause();

		const {timeoutPromise, clear} = makeTimeoutPromise({
			label: () =>
				[
					`Waited too long for progress:`,
					`smallest progress: ${getSmallestProgress()}`,
					`wanted minimum progress ${minimumProgress}`,
					`Report this at https://remotion.dev/report`,
				].join('\n'),
			ms: 10000,
			controller,
		});
		controller._internals._mediaParserController._internals.signal.addEventListener(
			'abort',
			clear,
		);

		await Promise.race([
			timeoutPromise,
			getSmallestProgress() === null
				? Promise.resolve()
				: (async () => {
						while (getSmallestProgress() < minimumProgress) {
							await waitForProgress();
						}
					})(),
		]).finally(() => clear());
		controller._internals._mediaParserController._internals.signal.removeEventListener(
			'abort',
			clear,
		);
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
		waitForProgress,
		waitForMinimumProgress,
		getStartingTimestamp,
		setPossibleLowestTimestamp,
	};
};

export type ProgressTracker = ReturnType<typeof makeProgressTracker>;
