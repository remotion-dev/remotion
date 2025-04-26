export type SamplePosition = {
	offset: number;
	size: number;
	isKeyframe: boolean;
	dts: number;
	cts: number;
	duration: number;
	chunk: number;
	bigEndian: boolean;
	chunkSize: number | null;
};
