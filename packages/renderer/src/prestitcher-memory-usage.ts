import os from 'os';

export const estimateMemoryUsageForPrestitcher = ({
	width,
	height,
}: {
	width: number;
	height: number;
}) => {
	// Empirically we detected that per 1 million pixels, FFMPEG uses around 1GB of memory, relatively independent of
	// the duration of the video.
	const memoryUsageFor4K = 1_000_000_000;
	const memoryUsageOfPixel = memoryUsageFor4K / 1_000_000;

	return memoryUsageOfPixel * width * height;
};

export const shouldUseParallelEncoding = ({
	width,
	height,
}: {
	width: number;
	height: number;
}) => {
	const freeMemory = os.freemem();
	const estimatedUsage = estimateMemoryUsageForPrestitcher({
		height,
		width,
	});

	const hasEnoughMemory =
		freeMemory - estimatedUsage > 2_000_000_000 &&
		estimatedUsage / freeMemory < 0.5;

	return {
		hasEnoughMemory,
		freeMemory,
		estimatedUsage,
	};
};
