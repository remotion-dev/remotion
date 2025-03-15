export type SeekSignal = {
	seek: (seek: Seek) => void;
	getSeek: () => Seek | undefined;
	clearSeekIfStillSame: (previousSeek: Seek) => void;
};

type SeekToTime = {
	type: 'time-in-seconds';
	time: number;
};
type SeekToByte = {
	type: 'byte';
	byte: number;
};

type ForceSeekToByte = {
	type: 'force-seek-to-byte';
	byte: number;
};

export type Seek = SeekToTime | SeekToByte | ForceSeekToByte;

export const makeSeekSignal = (): SeekSignal => {
	let seek: Seek | undefined;

	return {
		seek: (time) => {
			if (seek) {
				throw new Error('Seek already requested, must wait');
			}

			seek = time;
		},
		getSeek() {
			return seek;
		},
		// In the meanwhile a new seek could have been queued
		clearSeekIfStillSame(previousSeek: Seek) {
			if (seek === previousSeek) {
				seek = undefined;
			}
		},
	};
};
