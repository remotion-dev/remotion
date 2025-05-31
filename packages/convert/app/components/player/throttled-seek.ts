import {
	WEBCODECS_TIMESCALE,
	type MediaParserController,
} from '@remotion/media-parser';

type Seek = {
	getDesired: () => number;
	getObservedFramesSinceSeek: () => number[];
	addObservedFrame: (frame: number) => void;
	clearObservedFramesSinceSeek: () => void;
	replaceTimestamp: (ts: number) => void;
	isDone: () => boolean;
	isInfeasible: () => boolean;
};

const makeSeek = (_desired: number): Seek => {
	let desired = _desired;
	const observedFramesSinceSeek: number[] = [];

	return {
		getDesired: () => desired,
		getObservedFramesSinceSeek: () => observedFramesSinceSeek,
		addObservedFrame: (frame: number) => {
			observedFramesSinceSeek.push(frame);
		},
		clearObservedFramesSinceSeek: () => {
			observedFramesSinceSeek.length = 0;
		},
		replaceTimestamp: (ts: number) => {
			desired = ts;
		},
		isDone: () => {
			const hasBefore = observedFramesSinceSeek.some(
				(f) => f <= desired * WEBCODECS_TIMESCALE,
			);
			const hasAfter = observedFramesSinceSeek.some(
				(f) => f >= desired * WEBCODECS_TIMESCALE,
			);

			return hasBefore && hasAfter;
		},
		isInfeasible: () => {
			if (observedFramesSinceSeek.length === 0) {
				return false;
			}

			// all samples are after desired, 0.1 leniency
			const infeasible = observedFramesSinceSeek.every(
				(f) => f >= (desired + 0.1) * WEBCODECS_TIMESCALE,
			);

			if (infeasible) {
				console.log('infeasible', JSON.stringify(observedFramesSinceSeek));
			}

			return infeasible;
		},
	};
};

export const throttledSeek = (
	controller: MediaParserController,
	releaseSeek: (time: number) => void,
) => {
	let lastMediaParserSeek = 0;

	let currentSeek: Seek | null = null;

	const mediaParserSeek = (timestamp: number) => {
		lastMediaParserSeek = timestamp;
		controller.seek(timestamp);
		controller.resume();
	};

	return {
		seek: (timestamp: number) => {
			mediaParserSeek(timestamp);
		},
		getLastSeek: () => {
			return lastMediaParserSeek;
		},
		queueSeek: (seek: number) => {
			if (currentSeek !== null) {
				currentSeek.replaceTimestamp(seek);
				if (currentSeek.isInfeasible()) {
					currentSeek.clearObservedFramesSinceSeek();
					releaseSeek(currentSeek.getDesired());
				}

				return;
			}

			currentSeek = makeSeek(seek);
			releaseSeek(seek);
		},
		getDesiredSeek: () => {
			return currentSeek;
		},
		replaceWithNewestSeek: () => {
			if (!currentSeek) {
				throw new Error('No current seek');
			}

			currentSeek.clearObservedFramesSinceSeek();
			releaseSeek(currentSeek.getDesired());
		},
		clearSeek: () => {
			lastMediaParserSeek = currentSeek?.getDesired() ?? 0;
			currentSeek = null;
		},
	};
};
