export const planFrameRanges = ({
	chunkCount,
	chunkSize,
	frameCount,
}: {
	chunkCount: number;
	chunkSize: number;
	frameCount: number;
}): [number, number][] => {
	return new Array(chunkCount).fill(1).map((_, i) => {
		return [i * chunkSize, Math.min(frameCount, (i + 1) * chunkSize) - 1];
	});
};
