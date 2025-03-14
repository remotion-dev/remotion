export type SeekSignal = {
	seek: (seek: Seek) => void;
	getSeek: () => Seek | undefined;
};

type SeekToTime = {
	type: 'time-in-seconds';
	time: number;
};
type SeekToByte = {
	type: 'byte';
	byte: number;
};

type Seek = SeekToTime | SeekToByte;

export const makeSeekSignal = (): SeekSignal => {
	let seek: Seek | undefined;

	return {
		seek: (time) => {
			seek = time;
		},
		getSeek() {
			return seek;
		},
	};
};
