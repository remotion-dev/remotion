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

export type TimingProfile = ChunkTimingData[];

export type OptimizationProfile = {
	ranges: [number, number][];
	frameRange: [number, number];
	oldTiming: number;
	newTiming: number;
	createdFromRenderId: string;
	framesPerLambda: number;
	lambdaVersion: string;
	everyNthFrame: number;
};
