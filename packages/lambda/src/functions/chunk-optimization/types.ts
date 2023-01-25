export type ObjectChunkTimingData = {
	chunk: number;
	frameRange: [number, number];
	startDate: number;
	timings: {
		[key: number]: number;
	};
};

export type ChunkTimingData = Omit<ObjectChunkTimingData, 'timings'> & {
	timings: number[];
};
