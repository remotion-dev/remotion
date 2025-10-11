import type {MediaParserEmitter} from './emitter';

export type SeekSignal = {
	seek: (timeInSeconds: number) => void;
	getSeek: () => number | null;
	clearSeekIfStillSame: (previousSeek: number) => {hasChanged: boolean};
};

export const makeSeekSignal = (emitter: MediaParserEmitter): SeekSignal => {
	let seek: number | null = null;

	return {
		seek: (seekRequest) => {
			seek = seekRequest;
			emitter.dispatchSeek(seekRequest);
		},
		getSeek() {
			return seek;
		},
		// In the meanwhile a new seek could have been queued
		clearSeekIfStillSame(previousSeek: number) {
			if (seek === previousSeek) {
				seek = null;
				return {hasChanged: false};
			}

			return {hasChanged: true};
		},
	};
};
