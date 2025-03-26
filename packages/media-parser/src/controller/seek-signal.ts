import type {MediaParserEmitter} from './emitter';

export type SeekSignal = {
	seek: (seek: Seek) => void;
	getSeek: () => Seek | undefined;
	clearSeekIfStillSame: (previousSeek: Seek) => {hasChanged: boolean};
};

type SeekToTime = {
	type: 'keyframe-before-time-in-seconds';
	time: number;
};

type SeekToByte = {
	type: 'byte';
	byte: number;
};

export type Seek = SeekToTime | SeekToByte;

export const makeSeekSignal = (emitter: MediaParserEmitter): SeekSignal => {
	let seek: Seek | undefined;

	return {
		seek: (seekRequest) => {
			seek = seekRequest;
			emitter.dispatchSeek(seekRequest);
		},
		getSeek() {
			return seek;
		},
		// In the meanwhile a new seek could have been queued
		clearSeekIfStillSame(previousSeek: Seek) {
			if (seek === previousSeek) {
				seek = undefined;
				return {hasChanged: false};
			}

			return {hasChanged: true};
		},
	};
};
