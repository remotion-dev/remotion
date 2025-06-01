import type {FrameDatabase} from './frame-database';
import {isSeekInfeasible} from './seek-logic';

export type Seek = {
	getDesired: () => number;
	replaceTimestamp: (ts: number) => void;
};

const makeSeek = (_desired: number): Seek => {
	let desired = _desired;

	return {
		getDesired: () => desired,
		replaceTimestamp: (ts: number) => {
			desired = ts;
		},
	};
};

export const throttledSeek = (releaseSeek: (time: number) => void) => {
	let currentSeek: Seek | null = null;

	return {
		queueSeek: (seek: number, frameDatabase: FrameDatabase) => {
			if (currentSeek !== null) {
				currentSeek.replaceTimestamp(seek);
				if (isSeekInfeasible(frameDatabase, seek)) {
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

			releaseSeek(currentSeek.getDesired());
		},
		clearSeek: () => {
			currentSeek = null;
		},
	};
};
