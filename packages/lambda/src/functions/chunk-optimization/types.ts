export type ObjectChunkTimingData = {
	chunk: number;
	frameRange: [number, number];
	startDate: number;
	timings: {
		[key: number]: number;
	};
};
