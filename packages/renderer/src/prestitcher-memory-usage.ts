import type {LogLevel} from './log-level';
import {getAvailableMemory} from './memory/get-available-memory';

const MINIMUM_MEMORY_LEFT = 2_000_000_000;

export const hasEnoughMemoryForParallelEncoding = ({
	freeMemory,
	estimatedUsage,
}: {
	freeMemory: number;
	estimatedUsage: number;
}) => {
	return freeMemory - estimatedUsage > MINIMUM_MEMORY_LEFT;
};

const estimateMemoryUsageForPrestitcher = ({
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
	logLevel,
}: {
	width: number;
	height: number;
	logLevel: LogLevel;
}) => {
	const freeMemory = getAvailableMemory(logLevel);
	const estimatedUsage = estimateMemoryUsageForPrestitcher({
		height,
		width,
	});

	const hasEnoughMemory = hasEnoughMemoryForParallelEncoding({
		estimatedUsage,
		freeMemory,
	});

	return {
		hasEnoughMemory,
		freeMemory,
		estimatedUsage,
	};
};
